var Q = require('q');

var downloadConfig = {
  gtfsUrl: 'http://feed.rvtd.org/googleFeeds/static/google_transit.zip',
  downloadsDir: 'downloads'
}

describe('gtfs-download', function() {
  it('should download', function() {
    this.timeout(30000);

    var promise = function() {
      deferred = Q.defer();
      try{
        var gtfs = require('../index.js')(downloadConfig);
        gtfs = gtfs.downloadGtfs(function(err) {
          if(err) {
            deferred.reject(err);
          }
          deferred.resolve();
        });
      } catch(err) {
        deferred.reject(err);
      }
      return deferred.promise;
    }

    return promise();
  });
});