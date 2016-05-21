var fs = require('fs'),
  http = require('http'),
  path = require('path');  

var async = require('async'),
  Client = require('ftp'),
  parse = require('url-parse'),
  rimraf = require('rimraf');

module.exports = function(gtfsUrl, downloadsDir, callback) {

  if(!gtfsUrl) {
    var err = new Error('GTFS download url not specified.');
    return callback(err);
  }

  if(!downloadsDir) {
    var err = Error('GTFS download directory not specified.');
    return callback(err);
  }

  try {
    fs.mkdirSync(downloadsDir);
  } catch(e) {
    if ( e.code != 'EEXIST' ){ 
      return callback(e);
    }
  }

  // determine download protocol
  var parsed = parse(gtfsUrl);

  if(['http:', 'https:'].indexOf(parsed.protocol) > -1 ) {
    // download using http(s) the gtfs and save to the downloads folder
    var dlFile = downloadsDir + '/google_transit.zip'

    console.log('Downloading', gtfsUrl)
    async.auto({
      rm: function(cb) {
        rimraf(dlFile, cb)
      },
      dl: ['rm', function(results, cb) {
        var file = fs.createWriteStream(dlFile)
        http.get(gtfsUrl, function(response) {
          response.pipe(file)
          file.on('finish', function() {
            file.close(cb)
          })
        }).on('error', cb)
      }]
    }, callback)
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
    var error = new Error('unsupported download protocol');
    return callback(error);
  }

};