var fs = require('fs')
var path = require('path')

var yazl = require('yazl')

/**
 * Get gtfs config for a test suite
 */
function getConfig () {
  var config = {
    downloadsDir: 'tests',
    maxLoadTimeout: 60000,
    sequelizeOptions: {
      logging: false
    }
  }

  switch (process.env.DIALECT) {
    case 'mysql-spatial':
      config.spatial = true
      config.database = 'mysql://gtfs_sequelize:gtfs_sequelize@localhost:3306/gtfs_sequelize_test'
      break
    case 'mysql':
      config.database = 'mysql://gtfs_sequelize:gtfs_sequelize@localhost:3306/gtfs_sequelize_test'
      break
    case 'postgis':
      config.spatial = true
      config.database = 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs_sequelize_test'
      break
    case 'postgres':
      config.database = 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs_sequelize_test'
      break
    case 'sqlite':
      var sqliteStorage = path.resolve(__dirname) + '/temp.sqlite'
      config.sequelizeOptions.dialect = 'sqlite'
      config.sequelizeOptions.storage = sqliteStorage
      break
    default:
      throw new Error('Invalid DIALECT')
  }

  return config
}

var zipMockAgency = function (callback) {
  // make a gtfs zip file from the mock data and put it in the downloads directory
  var zipfile = new yazl.ZipFile()

  // add all files in mock agency folder
  var zipSourceDir = 'tests/mock_agency'
  fs.readdirSync(zipSourceDir)
    .forEach(function (file) {
      zipfile.addFile(path.join(zipSourceDir, file), file)
    })

  try {
    fs.mkdirSync('downloads')
  } catch (e) {
    if (e.code !== 'EEXIST') {
      callback(e)
    }
  }

  zipfile.outputStream.pipe(fs.createWriteStream(path.join('downloads', 'mock_gtfs.zip'))).on('close', function () {
    callback()
  })

  zipfile.end()
}

module.exports = {
  getConfig: getConfig,
  zipMockAgency: zipMockAgency
}
