
const downloadGtfs = require('./lib/download.js')
const loadgtfs = require('./lib/gtfsLoader.js')
const operations = require('./lib/operations')
const Database = require('./models')

module.exports = function (config) {
  const connectToDatabase = function (rawModels) {
    const db = Database(config.database, config.sequelizeOptions ? config.sequelizeOptions : {})
    if (!rawModels && config.spatial) {
      db.stop = db.sequelize.import('models/spatial/stop.js')
      db.shape_gis = db.sequelize.import('models/spatial/shape_gis.js')
      db.trip = db.sequelize.import('models/spatial/trip.js')
      // reassociate spatially-enable models
      db.stop.associate(db)
      db.shape_gis.associate(db)
      db.trip.associate(db)
    }
    return db
  }

  const download = function (callback) {
    downloadGtfs(config.gtfsUrl, config.downloadsDir, callback)
  }

  const interpolateStopTimes = function (callback) {
    const db = connectToDatabase()
    operations.interpolateStopTimes(db, callback)
  }

  const loadGtfs = function (callback) {
    loadgtfs(config.downloadsDir,
      config.gtfsFileOrFolder,
      connectToDatabase(true),
      config.spatial,
      config.interpolateStopTimes,
      callback)
  }

  return {
    config: config,
    connectToDatabase: connectToDatabase,
    downloadGtfs: download,
    interpolateStopTimes: interpolateStopTimes,
    loadGtfs: loadGtfs
  }
}
