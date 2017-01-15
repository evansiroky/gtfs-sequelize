# gtfs-sequelize

[![npm version](https://badge.fury.io/js/gtfs-sequelize.svg)](http://badge.fury.io/js/gtfs-sequelize) [![Build Status](https://travis-ci.org/evansiroky/gtfs-sequelize.svg?branch=master)](https://travis-ci.org/evansiroky/gtfs-sequelize) [![Dependency Status](https://david-dm.org/evansiroky/gtfs-sequelize.svg)](https://david-dm.org/evansiroky/gtfs-sequelize) [![Test Coverage](https://codeclimate.com/github/evansiroky/gtfs-sequelize/badges/coverage.svg)](https://codeclimate.com/github/evansiroky/gtfs-sequelize/coverage)

A model of the static GTFS using [sequelize.js](http://sequelizejs.com/).

Currently works only with PostgreSQL (including PostGIS), MySQL (with spatial capabilities) and sqlite (but NOT spatialite).

## Table of Contents

* [Installation](#installation)
* [Usage](#usage)

## Installation

In order to use this library, you must also install the additional libraries in your project depending on the database that you use.

### PostgreSQL

    npm install pg --save
    npm install pg-copy-streams --save
    npm install pg-hstore --save

#### With pg and node v0.10.x

You must also install the package `promise-polyfill` and write additional code.  See [here](https://github.com/brianc/node-postgres/issues/1057) for more details.

### MySQL

    npm install mysql --save
    npm install streamsql --save

### SQLite

    npm install sqlite3 --save
    npm install streamsql --save

Usage with SQLite requires that sqlite is installed and is available via a unix command line.

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
