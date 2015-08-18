# gtfs-sequelize
A model of the static GTFS using [sequelize.js](http://sequelizejs.com/).

## Current Status (as of 2015-08-17):

Project is in alpha version.  Currently tested with a small transit agency with PostgreSQL and PostGIS.

## Usage:

# Downloading the GTFS File:

    var GTFS = require('gtfs-sequelize');
    
    var downloadConfig = {
      gtfsUrl: 'http://feed.rvtd.org/googleFeeds/static/google_transit.zip',
      downloadsDir: 'downloads'
    };
    
    var gtfs = GTFS(downloadConfig);
    gtfs = gtfs.downloadGtfs(function() {
      //download has finished callback
    });

# Loading GTFS into Database:

    var GTFS = require('gtfs-sequelize');
    
    var pgConfig = {
      database: 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs-sequelize-test',
      downloadsDir: 'downloads',
      gtfsFilename: 'google_transit.zip',
      sequelizeOptions: {
        logging: false
      }
    }

    var gtfs = GTFS(pgConfig);
    gtfs = gtfs.loadGtfs(function() {
      //database loading has finished callback
    });
