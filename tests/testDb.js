var assert = require('chai').assert,
  fs = require("fs"),
  moment = require('moment'),
  path = require("path"),
  Promise = require('bluebird'),
  yazl = require("yazl");

// prepare config for tests
var config = {
  downloadsDir: 'tests',
  sequelizeOptions: {
    logging: false
  }
}

var gtfs, promise;

switch(process.env.DIALECT) {
  case 'mysql-spatial':
    config.spatial = true
  case 'mysql':
    config.database = 'mysql://gtfs_sequelize:gtfs_sequelize@localhost:3306/gtfs_sequelize_test'
    break;
  case 'postgis':
    config.spatial = true;
  case 'postgres':
    config.database = 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs_sequelize_test'
    break;
  default:
    throw new Error('Invalid DIALECT');
    break;
}

describe(process.env.DIALECT, function() {

  describe('loading', function() {

    before(function(done) {
      
      // make a gtfs zip file from the mock data and put it in the downloads directory
      var zipfile = new yazl.ZipFile();

      // add all files in mock agency folder
      var zipSourceDir = 'tests/mock_agency';
      fs.readdirSync(zipSourceDir)
        .forEach(function(file) {
          zipfile.addFile(path.join(zipSourceDir, file), file)
        });

      try {
        fs.mkdirSync('downloads');
      } catch(e) {
        if ( e.code != 'EEXIST' ){ 
          callback(e);
        }
      }

      zipfile.outputStream.pipe(fs.createWriteStream(path.join('downloads', 'mock_gtfs.zip'))).on("close", function() {
        done();
      });

      zipfile.end();

    })

    it('data should load from folder', function() {
      this.timeout(60000);

      config.gtfsFileOrFolder = 'mock_agency';
      
      gtfs = require('../index.js')(config);
      promise = Promise.promisify(gtfs.loadGtfs);

      return promise();
      
    });

    it('data should load from zip folder', function() {
      this.timeout(60000);

      config.downloadsDir = 'downloads';
      config.gtfsFileOrFolder = 'mock_gtfs.zip';
      
      gtfs = require('../index.js')(config);
      promise = Promise.promisify(gtfs.loadGtfs);

      return promise();
      
    });

  });

  describe('querying', function() {

    var db;

    before(function(done) {

      this.timeout(60000);

      // load mock gtfs file before running querying tests
      config.downloadsDir = 'tests';
      config.gtfsFileOrFolder = 'mock_agency';

      gtfs = require('../index.js')(config);
      gtfs.loadGtfs(function(err) {
        if(err) done(err);
        db = gtfs.connectToDatabase();
        done();
      });

    });

    it('agency query should work', function() {
      return db.agency
        .findAll({ include: [db.route] })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // uuid generated for agency_id when none provided
          assert.isAbove(data[0].agency_id.length, 0);

          // correct data
          assert.strictEqual(data[0].agency_name, 'West Coast Maglev');

          // associations
          assert.strictEqual(data[0].routes[0].route_long_name, 'Los Angeles - Seattle');
        });
    });

    it('calendar query should work', function() {
      return db.calendar
        .findAll({ 
          include: [db.calendar_date, db.trip],
          where: {
            service_id: 'weekend'
          }
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          // convert to utc because mysql has tz conversion issues
          assert.strictEqual(moment.utc(data[0].end_date).date(), 31);
          
          // associations
          // convert to utc because mysql has tz conversion issues
          assert.strictEqual(moment.utc(data[0].calendar_dates[0].date).date(), 25);  
          assert.strictEqual(data[0].trips[0].trip_headsign, 'Seattle Weekend Express'); 
        });
    });

    it('calendar_date query should work', function() {
      return db.calendar_date
        .findAll({ 
          include: [db.calendar],
          service_id: 'weekend'
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          // convert to utc because mysql has tz conversion issues
          assert.strictEqual(moment.utc(data[0].date).date(), 25);

          // associations
          // convert to utc because mysql has tz conversion issues
          assert.strictEqual(moment.utc(data[0].calendar.end_date).date(), 31);
        });
    });

    it('fare_attribute query should work', function() {
      return db.fare_attribute
        .findAll({ 
          include: [db.fare_rule],
          where: {
            fare_id: 'route_based_fare'
          }
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].fare_id, 'route_based_fare');

          // associations
          assert.strictEqual(data[0].fare_rules[0].fare_id, 'route_based_fare');
        });
    });

    describe('fare rules queries', function() {

      /* Don't fully understand how to get these working with sequelize yet
      it('route-based fare rule', function() {
        return db.fare_rule
          .findAll({ 
            include: [db.fare_attribute, db.route],
            where: {
              fare_id: 'route_based_fare'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // correct data
            assert.strictEqual(data[0].fare_id, 'route_based_fare');

            // associations
            assert.strictEqual(data[0].fare_attribute.price, 20);
            assert.strictEqual(data[0].route.route_id, 'LA-Seattle');
          });
      });

      it('origin-destination-based fare rule', function() {
        return db.fare_rule
          .findAll({ 
            include: [db.fare_attribute, {
                model: db.stop,
                as: 'origin_stop'
              }, {
                model: db.stop,
                as: 'destination_stop'
              }],
            where: {
              fare_id: 'origin_destination_fare'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // correct data
            assert.strictEqual(data[0].fare_id, 'origin_destination_fare');

            // associations
            assert.strictEqual(data[0].fare_attribute.price, 30);
            assert.strictEqual(data[0].origin_stop.stop_name, 'San Francisco');
            assert.strictEqual(data[0].destination_stop.stop_name, 'Portland');
          });
      });

      it('contains-based fare rule', function() {
        return db.fare_rule
          .findAll({ 
            include: [db.fare_attribute, {
                model: db.stop,
                as: 'contains_stop'
              }],
            where: {
              fare_id: 'contains_fare'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // correct data
            assert.strictEqual(data[0].fare_id, 'contains_fare');

            // associations
            assert.strictEqual(data[0].fare_attribute.price, 40);
            assert.strictEqual(data[0].contains_stop.stop_name, 'Sacramento');
          });
      });*/

    });

    it('feed_info query should work', function() {
      return db.feed_info
        .findAll()
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].feed_publisher_name, 'mock factory');
        });
    });

    it('frequency query should work', function() {
      return db.frequency
        .findAll({ include: [db.trip] })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].headway_secs, 7200);

          // associations
          assert.strictEqual(data[0].trip.trip_headsign, 'Seattle Weekday Express');
        });
    });

    it('route query should work', function() {
      return db.route
        .findAll({ 
          include: [db.trip, db.agency] 
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].route_short_name, 'LA-SEA');

          // associations
          assert.strictEqual(data[0].agency.agency_name, 'West Coast Maglev');
          assert.isAbove(data[0].trips.length, 0);
          //assert.strictEqual(data[0].fare_rules[0].fare_id, 'route_based_fare');
        });
    });

    it('shape query should work', function() {
      return db.shape
        .findAll({ 
          where: {
            shape_pt_sequence: 1
          }
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.closeTo(data[0].shape_pt_lat, 34.056313, 0.001);
        });
    });

    describe('stop queries should work', function() {
      
      it('stop served by stop_time', function() {
        return db.stop
          .findAll({ 
            include: [{
              model: db.stop_time,
              where: {
                trip_id: 'weekend_trip'
              }
            }],
            where: {
              stop_id: 'LA'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // correct data
            assert.strictEqual(data[0].stop_name, 'Los Angeles');
            if(config.spatial) {
              assert.strictEqual(data[0].geom.type, 'Point');
            }

            // associations
            assert.strictEqual(data[0].stop_times[0].arrival_time, 43200);
          });
      });

      /* Don't fully understand how to get these working with sequelize yet
      it('stop with origin fare rule', function() {
        return db.stop
          .findAll({ 
            include: [{
              model: db.fare_rule,
              as: 'fare_rule_origins'
            }],
            where: {
              stop_id: 'SF'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // associations
            assert.strictEqual(data[0].fare_rule_origins[0].fare_id, 'origin_destination_fare');
          });
      });

      it('stop with destination fare rule', function() {
        return db.stop
          .findAll({ 
            include: [{
              model: db.fare_rule,
              as: 'fare_rule_destinations'
            }],
            where: {
              stop_id: 'PDX'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // associations
            assert.strictEqual(data[0].fare_rule_destinations[0].fare_id, 'origin_destination_fare');
          });
      });

      it('stop with contains fare rule', function() {
        return db.stop
          .findAll({ 
            include: [{
              model: db.fare_rule,
              as: 'fare_rule_contains'
            }],
            where: {
              stop_id: 'SAC1'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // associations
            assert.strictEqual(data[0].fare_rule_contains[0].fare_id, 'contains_fare');
          });
      });

      it('stop with transfer from_stop', function() {
        return db.stop
          .findAll({ 
            include: [{
              model: db.transfer,
              as: 'transfer_from_stops'
            }],
            where: {
              stop_id: 'SAC1'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // associations
            assert.strictEqual(data[0].transfer_from_stops[0].transfer_type, 3);
          });
      });

      it('stop with transfer to_stop', function() {
        return db.stop
          .findAll({ 
            include: [{
              model: db.transfer,
              as: 'transfer_to_stops'
            }],
            where: {
              stop_id: 'SAC2'
            }
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // associations
            assert.strictEqual(data[0].transfer_to_stops[0].transfer_type, 3);
          });
      });
      */
    });

    it('stop_time query should work', function() {
      return db.stop_time
        .findAll({ 
          include: [db.trip, db.stop],
          where: {
            trip_id: 'weekend_trip',
            stop_sequence: 1
          }
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].arrival_time, 43200);

          // associations
          assert.strictEqual(data[0].trip.trip_headsign, 'Seattle Weekend Express');
          assert.strictEqual(data[0].stop.stop_name, 'Los Angeles');
        });
    });

    it('transfer query should work', function() {
      return db.transfer
        .findAll({ 
          include: [{
            model: db.stop,
            as: 'from_stop'
          }, {
            model: db.stop,
            as: 'to_stop'
          }]
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].transfer_type, 3);

          // associations
          assert.strictEqual(data[0].from_stop.stop_name, 'Sacramento');
          assert.strictEqual(data[0].to_stop.stop_name, 'Sacramento-2');
        });
    });

    it('trip query should work', function() {
      var includes = [db.route, db.stop_time, db.calendar, db.frequency];
      if(config.spatial) {
        includes.push(db.shape_gis);
      }
      return db.trip
        .findAll({ 
          include: includes,
          where: {
            trip_id: 'weekday_trips'
          }
        })
        .then(function(data) {
          // existence of record
          assert.isAbove(data.length, 0);

          // correct data
          assert.strictEqual(data[0].trip_headsign, 'Seattle Weekday Express');

          // associations
          assert.strictEqual(data[0].route.route_long_name, 'Los Angeles - Seattle');
          assert.isAbove(data[0].stop_times.length, 0);
          // convert to utc because mysql has tz conversion issues
          assert.strictEqual(moment.utc(data[0].calendar.end_date).date(), 31);
          assert.strictEqual(data[0].frequencies[0].headway_secs, 7200);
          if(config.spatial) {
            assert.strictEqual(data[0].shape_gi.geom.type, 'LineString');
          }
        });
    });

    if(config.spatial) {
      it('shape_gis query should work', function() {
        return db.shape_gis
          .findAll({ 
            include: [db.trip]
          })
          .then(function(data) {
            // existence of record
            assert.isAbove(data.length, 0);

            // correct data
            assert.strictEqual(data[0].geom.type, 'LineString');

            // associations
            assert.isAbove(data[0].trips.length, 0);
          });
      });
    } 

  });

});