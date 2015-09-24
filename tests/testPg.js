var Q = require('q');

var pgConfig = {
  database: 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs-sequelize-test',
  downloadsDir: 'downloads',
  gtfsFileOrFolder: 'google_transit.zip',
  sequelizeOptions: {
    logging: false
  }
}

describe('pg-load', function() {
  it('should load', function() {
    this.timeout(300000);
    
    var promise = function() {
      deferred = Q.defer();
      try{
        var gtfs = require('../index.js')(pgConfig);
        gtfs.loadGtfs(function(err) {
          if(err) {
            deferred.reject(err);
          } else {
            deferred.resolve();
          }
        });
      } catch(err) {
        deferred.reject(err);
      }
      return deferred.promise;
    }

    return promise();
    
  });
});