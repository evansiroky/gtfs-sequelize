const fs = require('fs')
const path = require('path')
const Transform = require('stream').Transform

const unzipper = require('unzipper')
const mkdirp = require('mkdirp')
const request = require('request')
const etl = require('etl')
const Sequelize = require('sequelize')

const loadModels = require('./models')

function GTFS (url, opts) {
  if (!(this instanceof GTFS)) {
    return new GTFS(opts)
  }
  this.url = url
  opts = opts || {}
  if (opts.database && opts.database instanceof Sequelize) {
    this.db = opts.database
  } else {
    opts.database = opts.database || 'sqlite://gtfs.db'
    opts.sequelizeOptions = opts.sequelizeOptions || {}
    opts.sequelizeOptions.logging = opts.sequelizeOptions.logging || false
    this.db = new Sequelize(opts.database, opts.sequelizeOptions)
  }
  if (opts.gisEnabled) {
    this.db.gisEnabled = true
  }
  const models = loadModels(this.db)
  this._models = Object.values(models)
  Object.assign(this, models)
}

GTFS.prototype.init = function (opts, callback) {
  opts = opts || {}
  opts.path = opts.path || './google_transit.zip'
  opts.force = opts.force || false
  opts.importLog = opts.importLog || false
  opts.minAge = opts.minAge || (60 * 24 * 60 * 60 * 1000) // 60 days in ms

  const promise = importData(this, opts)
  if (callback && typeof callback === 'function') {
    promise.then(callback)
  }
  return promise
}

module.exports = GTFS

function importData (gtfs, opts) {
  function log (message) {
    if (opts.importLog) {
      if (typeof opts.importLog === 'function') {
        opts.importLog(message)
      } else {
        console.log(message)
      }
    }
  }

  // make sure output directory exists
  return Sequelize.Promise.promisify(mkdirp)(path.dirname(opts.path))
    // check last modified date of zip file
    .then(() => zipFileLastModified(opts.path))
    .then(lastModified => {
      // if should re-import
      if (lastModified == null || (new Date().getTime() - lastModified) > opts.minAge || opts.force) {
        // download latest file
        return new Promise((resolve, reject) => {
          log('Downloading latest GTFS data')
          request(gtfs.url)
            .on('error', reject)
            .pipe(fs.createWriteStream(opts.path))
            .on('finish', resolve)
        })

        // re-create tables on the database
        .then(() => {
          log('recreating tables')
          // here we sync all models one at a time to protect any other tables that might be in the db
          return Promise.all(gtfs._models.map(model => model.sync({ force: true })))
        })
        // .then(() => db.query('PRAGMA foreign_keys = OFF')) // disable foreign keys so we can insert in arbitrary order
        .then(() => {
          // read the zip file
          log('reading data')
          return new Promise((resolve, reject) => {
            fs.createReadStream(opts.path)
              .pipe(unzipper.Parse())
              // stream each file into its table
              .pipe(createTableStream(gtfs, log))
              .on('error', reject)
              .on('finish', resolve)
          })
        })
      } else {
        return Promise.resolve() // already up-to-date
      }
    })
}

function zipFileLastModified (path) {
  return Sequelize.Promise.promisify(fs.stat)(path)
  .then(stats => stats.mtimeMs)
  .catch(err => {
    if (err.code === 'ENOENT') {
      return null // the file does not exist yet
    }
    throw err // otherwise rethrow
  })
}

function createTableStream (gtfs, log) {
  return new Transform({
    objectMode: true,
    transform: (entry, encoding, callback) => {
      // for each discovered entry in the zip file
      const filename = path.basename(entry.path)
      const model = gtfs._models.filter(model => model.filename === filename)[0]
      // if a table doesn't exist for it, skip it
      if (model == null) {
        log('skipping ' + filename)
        entry.autodrain()
        callback()
      } else {
        // read the entry as a csv
        log('reading ' + filename)
        entry
          // .pipe(csv({newline: '\r\n', objectMode: true, columns: true}))
          .pipe(etl.csv({ newline: '\r\n', santitize: true }))
          // .pipe(etl.map(item => trimObj(item)))
          .pipe(etl.collect(1000)) // collect 1000 records at a time for bulk-insert
          // insert each row into the database
          .pipe(etl.map(data => model.bulkCreate(data, {ignoreDuplicates: true})))
          .on('finish', callback)
          .on('error', callback)
      }
    }
  })
}
