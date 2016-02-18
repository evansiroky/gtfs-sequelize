var path = require('path'),
  downloadGtfs = require('./lib/download.js'),
  Database = require('./models'),
  loadgtfs = require('./lib/gtfsLoader.js');

module.exports = function(config) {

  var connectToDatabase = function(rawModels) {
    var db = Database(config.database, config.sequelizeOptions ? config.sequelizeOptions : {});
    if(!rawModels && config.spatial) {
      db.stop = db.sequelize.import('models/spatial/stop.js');
      db.shape_gis = db.sequelize.import('models/spatial/shape_gis.js');
      db.trip = db.sequelize.import('models/spatial/trip.js');
      // reassociate spatially-enable models
      db.stop.associate(db);
      db.shape_gis.associate(db);
      db.trip.associate(db);
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
      config.spatial,
      callback);
  }

  return {
    config: config,
    connectToDatabase: connectToDatabase,
    downloadGtfs: download,
    loadGtfs: loadGtfs
  }
}