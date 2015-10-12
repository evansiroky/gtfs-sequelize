var path = require('path'),
  downloadGtfs = require('./lib/download.js'),
  Database = require('./models'),
  loadgtfs = require('./lib/gtfsLoader.js');

module.exports = function(config) {

  var connectToDatabase = function(rawModels) {
    var db = Database(config.database, config.sequelizeOptions ? config.sequelizeOptions : {});
    if(!rawModels && config.isPostGIS) {
      db.stop = db.sequelize.import('models/postgis/stop.js');
      db.shape_gis = db.sequelize.import('models/postgis/shape_gis.js');
      db.trip = db.sequelize.import('models/postgis/trip.js');
    }
    return db;
  }

  var download = function(callback) {
    downloadGtfs(config.gtfsUrl, config.downloadsDir, callback);
  }

  var loadGtfs = function(callback) {
    loadgtfs(config.downloadsDir, 
      config.gtfsFileOrFolder, 
      connectToDatabase(true),
      config.isPostGIS,
      callback);
  }

  return {
    config: config,
    connectToDatabase: connectToDatabase,
    downloadGtfs: download,
    loadGtfs: loadGtfs
  }
}