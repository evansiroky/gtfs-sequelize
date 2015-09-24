var Client = require('ftp'),
  Download = require('download'),
  downloadStatus = require('download-status'),
  fs = require('fs'),
  parse = require('url-parse'),
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

  // determine download protocol
  var parsed = parse(gtfsUrl);

  if(['http:', 'https:'].indexOf(parsed.protocol) > -1 ) {
    // download using http(s) the gtfs and save to the downloads folder
    var download = new Download()
      .get(gtfsUrl)
      .dest(downloadsDir)
      .use(downloadStatus())
      .rename('google_transit.zip')
      .run(callback);
  } else if('ftp:' == parsed.protocol) {
    // download using ftp
    var c = new Client();
    c.on('ready', function() {
      console.log('downloading ' + parsed.pathname);
      c.get(parsed.pathname, function(err, stream) {
        if (err) {
          callback(err);
          return;
        }
        stream.once('close', function() { 
          c.end(); 
          callback();
        });
        stream.pipe(fs.createWriteStream(path.join(downloadsDir, 'google_transit.zip')));
      });
    });
    console.log('connecting to ftp');
    // connect to ftp
    c.connect({
      host: parsed.host,
      user: parsed.username,
      password: parsed.password
    });
  } else {
    var error = new Error('unknown download protocol');
    callback(error);
  }

};