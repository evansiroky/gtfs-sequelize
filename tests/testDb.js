var assert = require('assert'),
  fs = require("fs"),
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

var dbSpec, gtfs, promise;

for (var i = 0; i < process.argv.length; i++) {
  if(process.argv[i].indexOf('--db-spec') > -1) {
    dbSpec = process.argv[i].substr(10);
    break;
  }
}

switch(dbSpec) {
  case 'mysql-spatial':
    config.spatial = true
  case 'mysql':
    config.database = 'mysql://gtfs_sequelize:gtfs_sequelize@localhost:3306/gtfs-sequelize-test'
    break;
  case 'postgis':
    config.spatial = true;
  case 'pg':
    config.database = 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs-sequelize-test'
    break;
  default:
    throw new Error('invalid db-spec');
    break;
}

describe(dbSpec, function() {

  /*describe('loading', function() {

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

  });*/

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
          assert(data.length > 0);

          // uuid generated for agency_id when none provided
          assert(data[0].agency_id.length > 0);

          // correct data
          assert(data[0].agency_name === 'West Coast Maglev');

          // associations
          assert(data[0].routes[0].route_long_name === 'Los Angeles - Seattle');
        });
    });

    it('calendar query should work', function() {
      return db.calendar
        .findAll({ include: [db.calendar_date, db.trip] })
        .then(function(data) {
          // existence of record
          assert(data.length > 0);

          // correct data
          assert(data[0].service_id === 'abcd');
          
          // associations
          assert(data[0].calendar_dates.length > 0);  
          assert(data[0].trips[0].trip_headsign === 'Seattle Express'); 
        });
    });

    it('calendar_date query should work', function() {
      return db.calendar_date
        .findAll({ include: [db.calendar] })
        .then(function(data) {
          // existence of record
          assert(data.length > 0);

          // correct data
          assert(data[0].service_id === 'abcd');

          // associations
          assert(data[0].calendar.service_id === 'abcd');
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
          assert(data.length > 0);

          // correct data
          assert(data[0].fare_id === 'route_based_fare');

          // associations
          assert(data[0].fare_rules[0].fare_id === 'route_based_fare');
        });
    });

    describe('fare rules queries', function() {

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
            assert(data.length > 0);

            // correct data
            assert(data[0].fare_id === 'route_based_fare');

            // associations
            assert(data[0].fare_attribute.price === 20);
            assert(data[0].route.route_id === 'LA-Seattle');
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
            assert(data.length > 0);

            // correct data
            assert(data[0].fare_id === 'origin_destination_fare');

            // associations
            assert(data[0].fare_attribute.price === 30);
            assert(data[0].origin_stop.stop_name === 'San Francisco');
            assert(data[0].destination_stop.stop_name === 'Portland');
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
            assert(data.length > 0);

            // correct data
            assert(data[0].fare_id === 'contains_fare');

            // associations
            assert(data[0].fare_attribute.price === 40);
            assert(data[0].contains_stop.stop_name === 'Sacramento');
          });
      });

    });

  })

});