var fs = require('fs'),
  path = require('path'),
  async = require('async'),
  csv = require('csv'),
  moment = require('moment'),
  unzip = require('unzip2');

var DATE_FORMAT = 'YYYYMMDD';

// convert dateString to js date
var toDate = function(dateString) {
  return moment(dateString, DATE_FORMAT).toDate();
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

var loadGtfs = function(extractedFolder, db, callback) {
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

  // prepare loaders for synchronous execution
  async.map(fileLoaders, 
    function(loader, mapCallback) {
      mapCallback(null, 
        function(seriesCallback) { 
          loader(extractedFolder, db, seriesCallback); 
        }
      );
    }, 
    function(err, results) {
      // iterate syncrhonously through each table
      async.series(results,
        function(error, results) {
          console.log('Done loading');
          if(error) {
            throw error;
          }
          callback();
        }
      );
    }
  );
};

var insertCSVInTable = function(filename, model, callback, transformer) {
  console.log('Processing ' + filename);

  // prepare transformer in case it doesn't exist
  var transformer = transformer ? transformer : function(line) { return line; };
  
  // prepare processing function, but don't run it until file existance is confirmed
  var processTable = function() {
    model.sync({force: true}).then(function() {
      var input = fs.createReadStream(filename);
      var parser = csv.parse({
        columns: true,
        relax: true
      });
      var inserter = async.cargo(function(tasks, inserterCallback) {
          model.bulkCreate(tasks).then(function() {
              inserterCallback(); 
            }
          );
        },
        1000
      );
      parser.on('readable', function () {
        while(line = parser.read()) {
          inserter.push(transformer(line));
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
        throw err;
      }
    }
  );
}

var loadAgency = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'agency.txt'),
    db.agency,
    callback);
};

var loadStops = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'stops.txt'),
    db.stop,
    callback);
};

var loadRoutes = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'routes.txt'),
    db.route,
    callback);
};

var loadCalendar = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'calendar.txt'),
    db.calendar,
    callback,
    function(line) {
      // change date strings to js dates
      line.start_date = toDate(line.start_date);
      line.end_date = toDate(line.end_date);
      return line;
    }
  );
};

var loadCalendarDates = function(extractedFolder, db, callback) {
  insertCSVInTable(path.join(extractedFolder, 'calendar_dates.txt'),
    db.calendar_date,
    callback,
    function(line) {
      // change date string to js date
      line.date = toDate(line.date);
      return line;
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

module.exports = function(downloadsDir, gtfsFilename, db, callback) {
  
  // create unzipper
  var extractFolder = path.join(downloadsDir, 
      'google_transit'),
    extractor = unzip.Extract({ 
        path: extractFolder 
      }
    );

  // create handler to process gtfs upon completion of unzip
  extractor.on('close', 
    function() { 
      loadGtfs(extractFolder, db, callback); 
    } 
  );

  // unzip
  fs.createReadStream(path.join(downloadsDir, gtfsFilename)).pipe(extractor);

}