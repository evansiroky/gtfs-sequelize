var Promise = require('bluebird');

var downloadConfig = {
  gtfsUrl: 'http://scmtd.com/google_transit/google_transit.zip', // RVTD - small agency
  //gtfsUrl: 'http://www.vta.org/sfc/servlet.shepherd/document/download/069A0000001NUea',  // VTA - large agency
  downloadsDir: 'downloads'
}

describe('download', function() {
  it('should download', function() {
    this.timeout(3000000);

    var gtfs = require('../index.js')(downloadConfig),
      promise = Promise.promisify(gtfs.downloadGtfs);

    return promise();

  });
});