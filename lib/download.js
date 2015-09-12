var Download = require('download'),
  downloadStatus = require('download-status')
  fs = require('fs');

module.exports = function(gtfsUrl, downloadsDir, callback) {

  if(!gtfsUrl) {
    var err = new Error('GTFS download url not specified.');
    callback(err);
  }

  if(!downloadsDir) {
    var err = Error('GTFS download directory not specified.');
    callback(err);
  }

  try {
    fs.mkdirSync(downloadsDir);
  } catch(e) {
    if ( e.code != 'EEXIST' ){ 
      callback(e);
    }
  }

  // download the gtfs and save to the downloads folder
  var download = new Download()
    .get(gtfsUrl)
    .dest(downloadsDir)
    .use(downloadStatus())
    .rename('google_transit.zip')
    .run(callback);

};