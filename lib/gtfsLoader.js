var fs = require('fs'),
  path = require('path');

var async = require('async'),
  csv = require('csv'),
  dbStreamer = require('db-streamer'),
  moment = require('moment'),
  rimraf = require('rimraf'),
  unzip = require('unzip2'),
  uuid = require('uuid');

var util = require('./util.js');

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

var loadGtfs = function(extractedFolder, db, isSpatial, callback) {

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

  var dropAllTables = function(dropCallback) {
    
    var models = [db.feed_info,
      db.transfer,
      db.frequency,
      db.stop_time,
      db.calendar_date,
      db.fare_rule,
      db.fare_attribute,
      db.shape,
      db.trip,
      db.calendar,
      db.stop,
      db.route,
      db.agency];

    if(isSpatial) {
      models.splice(9, 0, db.sequelize.import('../models/spatial/shape_gis.js'));
    }

    console.log('dropping all gtfs tables');

    // iterate syncrhonously through each table
    async.eachSeries(models,
      function(model, modelCallback) {
        model.drop().then(modelCallback);
      },
      function(err) {
        console.log('tables dropped');
        dropCallback(err);
      }
    );
  };

  var loadAllFiles = function(loaders, loadCallback) {
    // iterate syncrhonously through each table
    async.series(loaders,
      function(err, results) {
        console.log('Done loading');
        loadCallback(err);
      }
    );
  };

  var postProcess = function(postProcessCallback) {
    if(isSpatial) {
      var dialect = db.sequelize.options.dialect;
      if(['postgres', 'mysql'].indexOf(dialect) == -1) {
        var err = Error('Spatial columns not supported for dialect ' + dialect + '.');
        postProcessCallback(err);
      } else {
        async.series([
            makeStopGeom,
            makeShapeTable
          ],
          function(err, results) {
            postProcessCallback(err);
          }
        );
      }
    } else {
      postProcessCallback();
    }
  }

  var makeStopGeom = function(seriesCallback) {
    console.log('adding stop geometry');
    var model = db.sequelize.import('../models/spatial/stop.js'),
      dialect = db.sequelize.getDialect(),
      alterStopTableQuery, geomUpdateQuery;

    db.stop = model;

    if(dialect == 'mysql') {

      alterStopTableQuery = 'ALTER TABLE stop ADD geom Point;';
      geomUpdateQuery = db.sequelize.fn('Point',
        db.sequelize.col('stop_lon'),
        db.sequelize.col('stop_lat'));
    
    } else if(dialect == 'postgres') {
      
      alterStopTableQuery = "SELECT AddGeometryColumn ('stop', 'geom', 4326, 'POINT', 2);";
      geomUpdateQuery = db.sequelize.literal('ST_SetSRID(ST_MakePoint(stop_lon, stop_lat), 4326)');
    
    }

    db.sequelize.query(alterStopTableQuery).then(function(results) {
      db.stop.update({
        geom: geomUpdateQuery
      }, { 
        where: {
          stop_lat: {
            gt: 0
          }
        } 
      }).then(function(){
        console.log('stop table altered');
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
          type: 'LineString',
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

    var model = db.sequelize.import('../models/spatial/shape_gis.js');
    model.sync({ force: true }).then(function() {
      db.shape_gis = model;
      db.trip = db.sequelize.import('../models/spatial/trip.js');
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
    function(err, preparedLoaders) {
      if(err) {
        return callback(err);
      }
      async.series([
          dropAllTables,
          function(loadingCallback) {
            loadAllFiles(preparedLoaders, loadingCallback);
          },
          postProcess],
        function(err) {
          callback(err);
        });
    }
  );
};

var insertCSVInTable = function(insertCfg, callback) {
  console.log('Processing ' + insertCfg.filename);

  // prepare transformer in case it doesn't exist
  var transformer = insertCfg.transformer ? insertCfg.transformer : function(line) { return line; },
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
    insertCfg.model.sync({force: true}).then(function() {
      var input = fs.createReadStream(insertCfg.filename),
        streamInserterCfg = util.makeInserterConfig(insertCfg.model),
        inserter = dbStreamer.getInserter(streamInserterCfg),
        parser = csv.parse({
          columns: true,
          relax: true
        });
      
      inserter.connect(function(err) {

        parser.on('readable', function () {
          while(line = parser.read()) {
            inserter.push(transformer2(line));
          }
        });
        
        parser.on('end', function (count) {
          inserter.setEndHandler(callback);
          inserter.end();
        });

        input.pipe(parser);

      });
    });
  }

  /** 
   * Check for file existance
   * - If it exists, process table
   * - If it doesn't exist, skip table
   * - If some other error, raise
   */
  fs.stat(insertCfg.filename, 
    function(err, stats) {
      if(!err || err.code != 'ENOENT') {
        processTable();
      } else if(err.code == 'ENOENT') {
        if(insertCfg.fileIsRequired === true) {
          var err = new Error(insertCfg.filename + ' <--- FILE NOT FOUND.  THIS FILE IS REQUIRED.  THIS FEED IS INVALID.');
          console.log(err);
          callback(err);
        } else {
          console.log(insertCfg.filename + ' <--- FILE NOT FOUND.  SKIPPING.');
          callback();
        }
      } else {
        callback(err);
      }
    }
  );
}

var loadAgency = function(extractedFolder, db, callback) {
  insertCSVInTable({
      fileIsRequired: true,
      filename: path.join(extractedFolder, 'agency.txt'),
      model: db.agency,
      transformer: function(line) {
        if(!line.agency_id) {
          // if no agency id provided, generate a unique identifier
          line.agency_id = uuid.v4();
        }
        lastAgencyId = line.agency_id;
        numAgencies++;
        return line;
      }
    },
    callback);
};

var loadStops = function(extractedFolder, db, callback) {
  insertCSVInTable({
      fileIsRequired: true,
      filename: path.join(extractedFolder, 'stops.txt'),
      model: db.stop
    },
    callback);
};

var loadRoutes = function(extractedFolder, db, callback) {
  insertCSVInTable({
      fileIsRequired: true,
      filename: path.join(extractedFolder, 'routes.txt'),
      model: db.route,
      transformer: function(line) {
        if(numAgencies == 1) {
          if(!line.agency_id) {
            line.agency_id = lastAgencyId;
          }
        }
        return line;
      }
    },
    callback);
};

// keep track of min and max dates found in case of omition of service_id in calendar.txt
// or omission of calendar.txt altogether
var minDateFound = null,
  maxDateFound = null,
  serviceIds = [];

var loadCalendar = function(extractedFolder, db, callback) {

  insertCSVInTable({
      filename: path.join(extractedFolder, 'calendar.txt'),
      model: db.calendar,
      transformer: function(line) {
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
    },
    callback
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

      var serviceIdsNotInCalendar = [],
        calendarInserterConfig = util.makeInserterConfig(db.calendar);

      // create inserter for calendar dates
      var calendarInserter = dbStreamer.getInserter(calendarInserterConfig);
      calendarInserter.connect(function(err, client) {
        
        var calendarDateInserterConfig = util.makeInserterConfig(db.calendar_date);
        calendarDateInserterConfig.client = client;
        calendarDateInserterConfig.deferUntilEnd = true;

        var calendarDateInserter = dbStreamer.getInserter(calendarDateInserterConfig);

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

          calendarDateInserter.setEndHandler(callback);

          // done parsing, resolve service ids not in calendar.txt
          calendarInserter.setEndHandler(function() {
            calendarDateInserter.end();
          });

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
                  calendarInserter.end();
                }
              }
            );
          } else {
            calendarInserter.end();
          }
        });
        input.pipe(parser);

      });
    });
  }

  /** 
   * Check for calendar.txt file existance
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
  insertCSVInTable({
      fileIsRequired: true,
      filename: path.join(extractedFolder, 'trips.txt'),
      model: db.trip
    },
    callback);
};

var loadStopTimes = function(extractedFolder, db, callback) {
  insertCSVInTable({
      fileIsRequired: true,
      filename: path.join(extractedFolder, 'stop_times.txt'),
      model: db.stop_time,
      transformer: function(line) {
        // change arrival and departure times into integer of seconds after midnight
        line.arrival_time = toSecondsAfterMidnight(line.arrival_time);
        line.departure_time = toSecondsAfterMidnight(line.departure_time);
        return line;
      }
    },
    callback);
};

var loadFareAttributes = function(extractedFolder, db, callback) {
  insertCSVInTable({
      filename: path.join(extractedFolder, 'fare_attributes.txt'),
      model: db.fare_attribute
    },
    callback);
};

var loadFareRules = function(extractedFolder, db, callback) {
  insertCSVInTable({
      filename: path.join(extractedFolder, 'fare_rules.txt'),
      model: db.fare_rule,
    },
    callback);
};

var loadShapes = function(extractedFolder, db, callback) {
  insertCSVInTable({
      filename: path.join(extractedFolder, 'shapes.txt'),
      model: db.shape
    },
    callback);
};

var loadFrequencies = function(extractedFolder, db, callback) {
  insertCSVInTable({
      filename: path.join(extractedFolder, 'frequencies.txt'),
      model: db.frequency,
      transformer: function(line) {
        line.start_time = toSecondsAfterMidnight(line.start_time);
        line.end_time = toSecondsAfterMidnight(line.end_time);
        return line;
      }
    },
    callback);
};

var loadTransfers = function(extractedFolder, db, callback) {
  insertCSVInTable({
      filename: path.join(extractedFolder, 'transfers.txt'),
      model: db.transfer
    },
    callback);
};

var loadFeedInfo = function(extractedFolder, db, callback) {
  insertCSVInTable({
      filename: path.join(extractedFolder, 'feed_info.txt'),
      model: db.feed_info
    },
    callback);
};

module.exports = function(downloadsDir, gtfsFileOrFolder, db, isSpatial, callback) {
  
  // determine if gtfs is a file or folder
  var gtfsPath = path.join(downloadsDir, gtfsFileOrFolder);
  fs.lstat(gtfsPath, function(err, stats) {
    if(err) {
      callback(err);
      return;
    }

    if(stats.isDirectory()) {
      loadGtfs(gtfsPath, db, isSpatial, callback);
    } else {
      // create unzipper (assuming gtfs is in zip file)
      var extractFolder = path.join(downloadsDir, 'google_transit'),
        extractor = unzip.Extract({ 
            path: extractFolder 
          }
        );

      // create handler to process gtfs upon completion of unzip
      extractor.on('close', 
        function() { 
          loadGtfs(extractFolder, db, isSpatial, callback); 
        } 
      );

      // delete former unzipped folder if it exists
      rimraf(extractFolder, function() {

        console.log('unzipping gtfs');

        // unzip
        fs.createReadStream(gtfsPath).pipe(extractor);
      });
      
    }
  });

}