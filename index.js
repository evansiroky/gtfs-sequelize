var path = require('path'),
  downloadGtfs = require('./lib/download.js'),
  Database = require('./models'),
  loadgtfs = require('./lib/gtfsLoader.js');

module.exports = function(config) {
	return {
    config: config,
    downloadGtfs: function(callback) {
      this._validateConfig();
      downloadGtfs(this.config.gtfsUrl, this.config.downloadsDir, callback);
    },
    loadGtfs: function(callback) {
      var db = Database(this.config.database, this.config.sequelizeOptions ? this.config.sequelizeOptions : {});
      loadgtfs(this.config.downloadsDir, this.config.gtfsFilename, db, callback);
    },
    _validateConfig: function() {

    }
  }
}