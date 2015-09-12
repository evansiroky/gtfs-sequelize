var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  csv = require('csv'),
  moment = require('moment'),
  unzip = require('unzip2');

var DATE_FORMAT = 'YYYYMMDD',
  numAgencies, lastAgencyId;

// convert dateString to moment
var toMoment = function(dateString) {
  return moment(dateString, DATE_FORMAT);
}

// convert timeString to int of seconds past midnight
var toSecondsAfterMidnight = function(timeString) {
  if(!timeString) {
    return null;
  }
  var timeArr = timeString.split(':');
  return parseInt(timeArr[0], 10) * 3600 + 
    parseInt(timeArr[1] , 10) * 60 +
    parseInt(timeArr[2]);
}

var loadGtfs = function(extractedFolder, db, isPostGIS, callback) {

  numAgencies = 0;
  lastAgencyId = null;

  // prepare loaders for each file
  var fileLoaders = [loadAgency, 
    loadStops,
    loadRoutes,
    loadCalendar,
    loadCalendarDates,
    loadTrips,
    loadStopTimes,
    loadFareAttributes,
    loadFareRules,
    loadShapes,
    loadFrequencies,
    loadTransfers,
    loadFeedInfo];

  var loadAllFiles = function(err, results) {
    // iterate syncrhonously through each table
    async.series(results,
      function(error, results) {
        console.log('Done loading');
        if(error) {
          callback(error);
        } else {
          postProcess();
        }
      }
    );
  };

  var postProcess = function() {
    if(isPostGIS) {
      if(db.sequelize.options.dialect != 'postgres') {
        var err = Error('database is not postgres dialect.  Unable to perform PostGIS postprocessing.');
        callback(err);
      } else {
        async.series([
            makeStopGeom,
            makeShapeTable
          ],
          function(error, results) {
            callback(error);
          }
        );
      }
    } else {
      callback();
    }
  }

  var makeStopGeom = function(seriesCallback) {
    console.log('adding stop geometry');
    var model = db.sequelize.import('../models/postgis/stop.js');
    db.stop = model;
    db.sequelize.query("SELECT AddGeometryColumn ('stop', 'geom', 4326, 'POINT', 2);").then(function(results) {
      db.stop.update({
        geom: db.sequelize.literal('ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)')
      }, { 
        where: {
          stop_lat: {
            gt: 0
          }
        } 
      }).then(function(){
        seriesCallback();
      });
    });
  };

  var makeShapeTable = function(seriesCallback) {
    console.log('creating shape_gis table');
    var processShape = function(shapePoint, shapeCallback) {
      db.shape.findAll({
        where: {
          shape_id: shapePoint.shape_id
        },
        order: [['shape_pt_sequence', 'ASC']],
        attributes: ['shape_pt_lat', 'shape_pt_lon']
      }).then(function(shapePoints) {
        var shapeGeom = {
          type: 'LINESTRING',
          crs: { type: 'name', properties: { name: 'EPSG:4326'} },
          coordinates: []
        };

        var addPointToShape = function(pt) {
          shapeGeom.coordinates.push([pt.shape_pt_lon, pt.shape_pt_lat]);
        }

        for (var i = 0; i < shapePoints.length; i++) {
          addPointToShape(shapePoints[i]);
        }
        
        db.shape_gis.create({
          shape_id: shapePoint.shape_id,
          geom: shapeGeom
        }).then(function() {
          shapeCallback();
        });
      });
    };

    var model = db.sequelize.import('../models/postgis/shape_gis.js');
    model.sync({ force: true }).then(function() {
      db.shape_gis = model;
      db.trip = db.sequelize.import('../models/postgis/trip.js');
      db.shape.findAll({
        attributes: [db.Sequelize.literal('DISTINCT shape_id'), 'shape_id']
      }).then(function(shapeIds) {
        async.each(shapeIds, processShape, seriesCallback);
      });
    });
  };

  // prepare loaders for synchronous execution
  async.map(fileLoaders, 
    function(loader, mapCallback) {
      mapCallback(null, 
        function(seriesCallback) { 
          loader(extractedFolder, db, seriesCallback); 
        }
      );
    }, 
    loadAllFiles
  );
};

var insertCSVInTable = function(filename, model, callback, transformer) {
  console.log('Processing ' + filename);

  // prepare transformer in case it doesn't exist
  var transformer = transformer ? transformer : function(line) { return line; },
    transformer2 = function(line) {
      line = transformer(line);
      for(k in line) {
        if(line[k] === '') {
          line[k] = null;
        }
      }
      return line;
    };

  // prepare processing function, but don't run it until file existance is confirmed
  var processTable = function() {
    model.sync({force: true}).then(function() {
      var input = fs.createReadStream(filename);
      var parser = csv.parse({
        columns: true,
        relax: true
      });
      var inserter = async.cargo(function(data, inserterCallback) {
          model.bulkCreate(data).then(function() {
              inserterCallback(); 
            }
          );
        },
        1000
      );
      parser.on('readable', function () {
        while(line = parser.read()) {
          inserter.push(transformer2(line));
        }
      });
      parser.on('end', function (count) {
        inserter.drain = function() {
          callback();
        }
      });
      input.pipe(parser);
    });
  }

  /** 
   * Check for file existance
   * - If it exists, process table
   * - If it doesn't exist, skip table
   * - If some other error, raise
   */
  fs.stat(filename, 
    function(err, stats) {
      if(!err || err.code != 'ENOENT') {
        processTable();
      } else if(err.code == 'ENOENT') {
        console.log(filename + ' <--- FILE NOT FOUND.  SKIPPING.');
        callback();
      } else {
        callback(err);
      }
    }
  );
}

var loadAgency = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'agency.txt'),
    db.agency,
    callback,
    function(line) {
      lastAgencyId = line.agency_id;
      numAgencies++;
      return line;
    });
};

var loadStops = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'stops.txt'),
    db.stop,
    callback);
};

var loadRoutes = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'routes.txt'),
    db.route,
    callback,
    function(line) {
      if(numAgencies == 1) {
        if(!line.agency_id) {
          line.agency_id = lastAgencyId;
        }
      }
      return line;
    });
};

// keep track of min and max dates found in case of omition of service_id in calendar.txt
// or omission of calendar.txt altogether
var minDateFound = null,
  maxDateFound = null,
  serviceIds = [];

var loadCalendar = function(extractedFolder, db, callback) {

  insertCSVInTable(path.join(extractedFolder, 'calendar.txt'),
    db.calendar,
    callback,
    function(line) {
      // keep track of date range
      var start_date = toMoment(line.start_date),
        end_date = toMoment(line.end_date);

      if(!minDateFound || start_date.isBefore(minDateFound)) {
        minDateFound = moment(start_date);
      }

      if(!maxDateFound || end_date.isAfter(maxDateFound)) {
        maxDateFound = moment(end_date);
      }

      // keep track track of service ids found
      serviceIds.push(line.service_id);

      // change date strings to js dates
      line.start_date = start_date.toDate();
      line.end_date = end_date.toDate();
      return line;
    }
  );
};

var loadCalendarDates = function(extractedFolder, db, callback) {
  var filename = path.join(extractedFolder, 'calendar_dates.txt');

  console.log('Processing ' + filename);

  // prepare processing function, but don't run it until file existance is confirmed
  var processCalendarDates = function() {
    db.calendar_date.sync({force: true}).then(function() {
      var input = fs.createReadStream(filename);
      var parser = csv.parse({
        columns: true,
        relax: true
      });

      // create inserter for calendar dates
      var calendarDateInserter = async.cargo(function(data, inserterCallback) {
          db.calendar_date.bulkCreate(data).then(function() {
              inserterCallback(); 
            }
          );
        },
        1000
      );

      calendarDateInserter.pause();

      // create inserter for calendar entries found in calendar_dates.txt, but not in calendar.txt
      var calendarInserter = async.cargo(function(data, inserterCallback) {
          db.calendar.bulkCreate(data).then(function() {
              inserterCallback(); 
            }
          );
        },
        1000
      );

      calendarInserter.pause();

      var serviceIdsNotInCalendar = [];

      parser.on('readable', function () {
        while(line = parser.read()) {
          var exceptionMoment = toMoment(line.date);

          if(!minDateFound || exceptionMoment.isBefore(minDateFound)) {
            minDateFound = moment(exceptionMoment);
          }

          if(!maxDateFound || exceptionMoment.isAfter(maxDateFound)) {
            maxDateFound = moment(exceptionMoment);
          }

          line.date = exceptionMoment.toDate();
          calendarDateInserter.push(line);
          if(serviceIds.indexOf(line.service_id) == -1 &&
              serviceIdsNotInCalendar.indexOf(line.service_id) == -1) {
            // service id not found in calendar.txt, add to list to parse at end
            serviceIdsNotInCalendar.push(line.service_id);
          }
        }
      });
      parser.on('end', function (count) {
        // done parsing, resolve service ids not in calendar.txt
        calendarInserter.drain = function() {
          calendarDateInserter.drain = function() {
            callback();
          }
          calendarDateInserter.resume();
        }

        var minDate = minDateFound.toDate(),
          maxDate = maxDateFound.toDate();

        if(serviceIdsNotInCalendar.length > 0) {
          async.each(serviceIdsNotInCalendar,
            function(service_id, itemCallback) {
              calendarInserter.push({
                service_id: service_id,
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0,
                start_date: minDate,
                end_date: maxDate
              });
              itemCallback();
            },
            function(err) {
              if(err) {
                callback(err);
              } else {
                calendarInserter.resume();
              }
            }
          );
        } else {
          calendarDateInserter.drain = function() {
            console.log('calendarDateInserter drain');
            callback();
          }
          calendarDateInserter.resume();
        }
      });
      input.pipe(parser);
    });
  }

  /** 
   * Check for file existance
   * - If it exists, process table
   * - If it doesn't exist, callback with err if calendar not found or skip table
   * - If some other error, callback with err
   */
  fs.stat(filename, 
    function(err, stats) {
      if(!err || err.code != 'ENOENT') {
        processCalendarDates();
      } else if(err.code == 'ENOENT') {
        if(!minDateFound) {
          var errMsg = 'Neither calendar.txt or calendar_dates.txt files found!  ' +
            'This feed is invalid!';
          callback(errMsg);
        } else {
          console.log(filename + ' <--- FILE NOT FOUND.  SKIPPING.');
          callback();
        }
      } else {
        callback(err);
      }
    }
  );
  
};

var loadTrips = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'trips.txt'),
    db.trip,
    callback);
};

var loadStopTimes = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'stop_times.txt'),
    db.stop_time,
    callback,
    function(line) {
      // change arrival and departure times into integer of seconds after midnight
      line.arrival_time = toSecondsAfterMidnight(line.arrival_time);
      line.departure_time = toSecondsAfterMidnight(line.departure_time);
      return line;
    });
};

var loadFareAttributes = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'fare_attributes.txt'),
    db.fare_attribute,
    callback);
};

var loadFareRules = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'fare_rules.txt'),
    db.fare_rule,
    callback);
};

var loadShapes = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'shapes.txt'),
    db.shape,
    callback);
};

var loadFrequencies = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'frequncies.txt'),
    db.frequncy,
    callback);
};

var loadTransfers = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'transfers.txt'),
    db.transfer,
    callback);
};

var loadFeedInfo = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'feed_info.txt'),
    db.feed_info,
    callback);
};

module.exports = function(downloadsDir, gtfsFilename, db, isPostGIS, callback) {
  
  // create unzipper
  var extractFolder = path.join(downloadsDir, 'google_transit'),
    extractor = unzip.Extract({ 
        path: extractFolder 
      }
    );

  // create handler to process gtfs upon completion of unzip
  extractor.on('close', 
    function() { 
      loadGtfs(extractFolder, db, isPostGIS, callback); 
    } 
  );

  // unzip
  fs.createReadStream(path.join(downloadsDir, gtfsFilename)).pipe(extractor);

}