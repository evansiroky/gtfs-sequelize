var request = require('request'),
  fs = require('fs'),
  path = require('path');

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
  console.log('downloading gtfs from: ' + gtfsUrl);
  var file = fs.createWriteStream(path.join(downloadsDir, 'google_transit.zip')),
    r = request(gtfsUrl).pipe(file);
  r.on('error', callback);
  r.on('finish', function() { 
    console.log('finished download');
    file.close(callback) 
  });

};