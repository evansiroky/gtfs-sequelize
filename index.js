var path = require('path'),
  downloadGtfs = require('./lib/download.js'),
  Database = require('./models'),
  loadgtfs = require('./lib/gtfsLoader.js');

module.exports = function(config) {
	return {
    config: config,
    connectToDatabase: function() {
      return Database(this.config.database, this.config.sequelizeOptions ? this.config.sequelizeOptions : {});
    },
    downloadGtfs: function(callback) {
      this._validateConfig();
      downloadGtfs(this.config.gtfsUrl, this.config.downloadsDir, callback);
    },
    loadGtfs: function(callback) {
      loadgtfs(this.config.downloadsDir, 
        this.config.gtfsFilename, 
        this.connectToDatabase(),
        config.isPostGIS,
        callback);
    },
    _validateConfig: function() {

    }
  }
}