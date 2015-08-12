var request = require('request'),
  fs = require('fs'),
  path = require('path');

module.exports = function(gtfs_url, downloads_dir, callback) {

  if(!gtfs_url) {
    var err = new Error('GTFS download url not specified.');
    throw err;
  }

  if(!downloads_dir) {
    var err = Error('GTFS download directory not specified.');
    throw err;
  }

  try {
    fs.mkdirSync(downloads_dir);
  } catch(e) {
    if ( e.code != 'EEXIST' ){ 
      throw e;
    }
  }

  // download the gtfs and save to the downloads folder
  var file = fs.createWriteStream(path.join(downloads_dir, 'google_transit.zip')),
    r = request(gtfs_url).pipe(file);
  r.on('error', function(err) { throw err; });
  r.on('finish', function() { file.close(callback) });

};