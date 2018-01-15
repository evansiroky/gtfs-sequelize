# gtfs-sequelize

[![npm version](https://badge.fury.io/js/gtfs-sequelize.svg)](http://badge.fury.io/js/gtfs-sequelize) [![Build Status](https://travis-ci.org/evansiroky/gtfs-sequelize.svg?branch=master)](https://travis-ci.org/evansiroky/gtfs-sequelize) [![Dependency Status](https://david-dm.org/evansiroky/gtfs-sequelize.svg)](https://david-dm.org/evansiroky/gtfs-sequelize) [![Test Coverage](https://codeclimate.com/github/evansiroky/gtfs-sequelize/badges/coverage.svg)](https://codeclimate.com/github/evansiroky/gtfs-sequelize/coverage)

A model of the static GTFS using [sequelize.js](http://sequelizejs.com/).

Currently works only with PostgreSQL (including PostGIS), MySQL (with spatial capabilities) and sqlite (but NOT spatialite).

## Table of Contents

* [Installation](#installation)
* [API](#api)

## Installation

In order to use this library, you must also install the additional libraries in your project depending on the database that you use.

### PostgreSQL

    npm install pg --save
    npm install pg-copy-streams --save
    npm install pg-query-stream --save
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

## API:

### GTFS(options)

Create a new GTFS API.

Example:

```js
var GTFS = require('gtfs-sequelize');

var pgConfig = {
  database: 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs-sequelize-test',
  downloadsDir: 'downloads',
  gtfsFileOrFolder: 'google_transit.zip',
  spatial: true,
  sequelizeOptions: {
    logging: false
  }
}

var gtfs = GTFS(pgConfig);
gtfs.loadGtfs(function() {
  //database loading has finished callback
});
```

#### options

| Key | Value |
| -- | -- |
| database | A database connection string.  You must specify a user and a database in your connection string.  The database must already exist, but the tables within the db do not need to exist. |
| downloadsDir | The directory where you want the feed zip fils downloaded to or where you're going to read the feed read from. |
| gtfsFileOrFolder | The (zip) file or folder to load the gtfs from |
| interpolateStopTimes | Default is undefined.  If true, after loading the stop_times table, all stop_times with undefined arrival and departure times will be updated to include interpolated arrival and departure times. |
| sequelizeOptions | Options to pass to sequelize.  Note: to use a specific schema you'll want to pass something like this: `{ schema: 'your_schema' }` |
| spatial | Default is undefined.  If true, spatial tables for the shapes and stops will be created. |

### gtfs.connectToDatabase()

Return a sequelize api of the database.

Example:

```js
var db = gtfs.connectToDatabase()

db.stop.findAll()
  .then(stops => {
    console.log(stops)
  })
```

### gtfs.downloadGtfs(callback)

If a url is provided, the feed will be attempted to be downloaded.  Works with `http`, `https` and `ftp`.

### gtfs.interpolateStopTimes(callback)

Interpolate stop_times with undefined arrival and departure times.  If you load a gtfs with the `interpolateStopTimes` flag set to true, you don't need to call this.

### gtfs.loadGtfs(callback)

Load the gtfs into the database.
