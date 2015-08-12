var downloadConfig = {
  gtfsUrl: 'http://feed.rvtd.org/googleFeeds/static/google_transit.zip',
  downloadsDir: 'downloads'
}

describe('gtfs-download', function() {
  it('should download', function(done) {
    this.timeout(30000);
    var gtfs = require('../index.js')(downloadConfig);
    gtfs = gtfs.downloadGtfs(done);
    setTimeout(done, 29800);
  });
});