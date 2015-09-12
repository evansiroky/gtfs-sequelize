var Q = require('q');

var downloadConfig = {
  gtfsUrl: 'http://feed.rvtd.org/googleFeeds/static/google_transit.zip', // RVTD - small agency
  //gtfsUrl: 'http://www.vta.org/sfc/servlet.shepherd/document/download/069A0000001NUea',  // VTA - large agency
  downloadsDir: 'downloads'
}

describe('gtfs-download', function() {
  it('should download', function() {
    this.timeout(300000);

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