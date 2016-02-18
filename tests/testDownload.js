var Promise = require('bluebird');

describe('download', function() {

  var gtfs, promise;
  
  it('gtfs should download via http', function() {
    this.timeout(3000000);

    gtfs = require('../index.js')({
      gtfsUrl: 'http://feed.rvtd.org/googleFeeds/static/google_transit.zip',
      downloadsDir: 'downloads'
    });

    promise = Promise.promisify(gtfs.downloadGtfs);

    return promise();

  });

  it('gtfs should download via ftp', function() {
    this.timeout(3000000);

    gtfs = require('../index.js')({
      gtfsUrl: 'ftp://metrostlouis.org/Transit/google_transit.zip',
      downloadsDir: 'downloads'
    })

    promise = Promise.promisify(gtfs.downloadGtfs);

    return promise();

  });
});