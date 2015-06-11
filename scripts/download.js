var request = require('request'),
  util = require('../lib/util.js'),
  fs = require('fs');

try {
  config = require('../config.js');
} catch (e) {
  util.quitOnError(new Error('Cannot find config.js'));
}

if(!config.gtfs_url) {
  util.quitOnError(new Error('GTFS download url not specified.'));
}

if(!config.downloads_dir) {
  util.quitOnError(new Error('GTFS download directory not specified.'));
}

try {
  fs.mkdirSync(config.downloads_dir);
} catch(e) {
  if ( e.code != 'EEXIST' ){ 
    util.quitOnError(e);
  }
}

request(config.gtfs_url).pipe(fs.createWriteStream(config.downloads_dir + '/google_transit.zip'));