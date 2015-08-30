var path = require('path'),
  downloadGtfs = require('./lib/download.js'),
  Database = require('./models'),
  loadgtfs = require('./lib/gtfsLoader.js');

module.exports = function(config) {
  return {
    config: config,
    connectToDatabase: function(rawModels) {
      var db = Database(this.config.database, this.config.sequelizeOptions ? this.config.sequelizeOptions : {});
      if(config.isPostGIS) {
        db.stop = db.sequelize.import('models/postgis/stop.js');
        db.shape_gis = db.sequelize.import('models/postgis/shape_gis.js');
        db.trip = db.sequelize.import('models/postgis/trip.js');
      }
      return db;
    },
    downloadGtfs: function(callback) {
      this._validateConfig();
      downloadGtfs(this.config.gtfsUrl, this.config.downloadsDir, callback);
    },
    loadGtfs: function(callback) {
      loadgtfs(this.config.downloadsDir, 
        this.config.gtfsFilename, 
        this.connectToDatabase(true),
        config.isPostGIS,
        callback);
    },
    _validateConfig: function() {

    }
  }
}