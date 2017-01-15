var fs = require('fs');

var assert = require('chai').assert,
  nock = require('nock'),
  rimraf = require('rimraf');

var util = require('./util.js')

var GTFS = require('../index.js')

var makeFileIsDownloadedVerificationFn = function(callback) {

  var aWhileAgo = (new Date()).getTime() - 100000

  return function(err) {
    try {
      assert.isNotOk(err)
    } catch(e) {
      return callback(e)
    }

    fs.stat('./downloads/google_transit.zip', function(err, stats) {

      try {
        assert.isNotOk(err)
        assert.isAbove(stats.ctime.getTime(), aWhileAgo, 'file update time is before test!')
      } catch(e) {
        return callback(e)
      }

      callback()

    })
  }
}

describe('download', function() {

  var BASE_URL = 'http://example.com/',
    NOCK_HOST = 'http://example.com'

  var gtfs, promise;

  before(function(done) {
    util.zipMockAgency(done)
  })

  afterEach(function(done) {
    rimraf('./downloads', done)
  })

  describe('data sanity checks', function() {

    it('should fail without url being provided', function(done) {
      gtfs = GTFS({})
      gtfs.downloadGtfs(function(err) {
        assert.isOk(err);
        assert.property(err, 'message');
        assert.equal(err.message, 'GTFS download url not specified.');
        done();
      })
    })

    it('should fail without downloads directory being provided', function(done) {
      gtfs = GTFS({ gtfsUrl: 'http://example.com/gtfs.zip' })
      gtfs.downloadGtfs(function(err) {
        assert.isOk(err);
        assert.property(err, 'message');
        assert.equal(err.message, 'GTFS download directory not specified.');
        done();
      })
    })

    it('should fail with invalid protocol url being provided', function(done) {
      gtfs = GTFS({
        gtfsUrl: 'xyz://example.com/gtfs.zip',
        downloadsDir: 'downloads'
      })
      gtfs.downloadGtfs(function(err) {
        assert.isOk(err);
        assert.property(err, 'message');
        assert.equal(err.message, 'unsupported download protocol');
        done();
      })
    })
  })

  it('gtfs should download via http', function(done) {

    var scope = nock(NOCK_HOST)
        .get('/google_transit.zip')
        .replyWithFile(200, './downloads/mock_gtfs.zip')

    var doneHelper = function(err) {
      scope.done()
      done(err)
    }

    gtfs = GTFS({
      gtfsUrl: BASE_URL + 'google_transit.zip',
      downloadsDir: 'downloads'
    });

    gtfs.downloadGtfs(makeFileIsDownloadedVerificationFn(doneHelper))

  });

  it('gtfs should download via ftp', function(done) {
    this.timeout(3000000);

    gtfs = GTFS({
      gtfsUrl: 'ftp://metrostlouis.org/Transit/google_transit.zip',
      downloadsDir: 'downloads'
    })

    gtfs.downloadGtfs(makeFileIsDownloadedVerificationFn(done))

  });
});
