# gtfs-sequelize

[![npm version](https://badge.fury.io/js/gtfs-sequelize.svg)](http://badge.fury.io/js/gtfs-sequelize) [![Build Status](https://travis-ci.org/evansiroky/gtfs-sequelize.svg?branch=master)](https://travis-ci.org/evansiroky/gtfs-sequelize) [![Dependency Status](https://david-dm.org/evansiroky/gtfs-sequelize.svg)](https://david-dm.org/evansiroky/gtfs-sequelize) [![Test Coverage](https://codeclimate.com/github/evansiroky/gtfs-sequelize/badges/coverage.svg)](https://codeclimate.com/github/evansiroky/gtfs-sequelize/coverage)

A model of the static GTFS using [sequelize.js](http://sequelizejs.com/).

Currently works only with PostgreSQL (including PostGIS) or MySQL.

## Usage:

### Downloading the GTFS File:

    var GTFS = require('gtfs-sequelize');
    
    var downloadConfig = {
      gtfsUrl: 'http://feed.rvtd.org/googleFeeds/static/google_transit.zip',
      downloadsDir: 'downloads'
    };
    
    var gtfs = GTFS(downloadConfig);
    gtfs.downloadGtfs(function() {
      //download has finished callback
    });

### Loading GTFS into Database:

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
    gtfs.loadGtfs(function() {
      //database loading has finished callback
    });
    
### Loading into a DB with PostGIS installed:

    var GTFS = require('gtfs-sequelize');
    
    var pgConfig = {
      database: 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs-sequelize-test',
      downloadsDir: 'downloads',
      gtfsFilename: 'google_transit.zip',
      spatial: true,
      sequelizeOptions: {
        logging: false
      }
    }

    var gtfs = GTFS(pgConfig);
    gtfs.loadGtfs(function() {
      //database loading has finished callback
    });

  

