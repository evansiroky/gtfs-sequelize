var fs = require('fs'),
  unzip = require('unzip2'),
  util = require('../lib/util.js'),
  models = require("../models");

// get config
try {
  config = require('../config.js');
} catch (e) {
  util.quitOnError(new Error('Cannot find config.js'));
}

// ensure downloads dir is specified
if(!config.downloads_dir) {
  util.quitOnError(new Error('GTFS download directory not specified.'));
}

// unzip gtfs
var gtfs_file = config.downloads_dir + '/google_transit.zip',
  gtfs_out_dir = config.downloads_dir + '/google_transit';

fs.createReadStream(gtfs_file).pipe(unzip.Extract({ path: gtfs_out_dir }));

// load into db
console.log(models);