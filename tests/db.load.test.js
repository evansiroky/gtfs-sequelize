var assert = require('chai').assert

var GTFS = require('../index.js')

if (typeof Promise === 'undefined') {
  global.Promise = require('promise-polyfill')
}

var util = require('./util.js')

// prepare config for tests
describe(process.env.DIALECT, function () {
  describe('loading', function () {
    before(function (done) {
      // zip up the mock agency before tests
      util.zipMockAgency(done)
    })

    beforeEach(function (done) {
      // drop and create the database before each test
      var config = util.getConfig()
      var gtfs = GTFS(config)
      var db = gtfs.connectToDatabase()
      db.sequelize.drop()
        .then(() => done())
        .catch(done)
    })

    it('data should load from folder', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.gtfsFileOrFolder = 'mock_agency'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(done)
    })

    it('data should load from zip folder', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.downloadsDir = 'downloads'
      config.gtfsFileOrFolder = 'mock_gtfs.zip'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(done)
    })

    it('should fail gracefully with an invalid feed folder', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.downloadsDir = 'tests'
      config.gtfsFileOrFolder = 'invalid_feed_1'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(function (err) {
        assert.include(err.message, 'agency.txt <--- FILE NOT FOUND.  THIS FILE IS REQUIRED.  THIS FEED IS INVALID.')
        done()
      })
    })

    it('should fail gracefully when both calendar files are missing', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.downloadsDir = 'tests'
      config.gtfsFileOrFolder = 'invalid_feed_2'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(function (err) {
        assert.include(err.message, 'NEITHER calendar.txt OR calendar_dates.txt IS PRESENT IN THIS FEED.  THIS FEED IS INVALID.')
        done()
      })
    })

    it('data should load from feed with wide range in calendar dates', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.downloadsDir = 'tests'
      config.gtfsFileOrFolder = 'feed_with_wide_range_in_calendar_dates'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(function (err) {
        assert.isNotOk(err)

        // inspect the calendar table and expect to find christmas service
        var db = gtfs.connectToDatabase()
        db.calendar
          .findAll({
            include: [db.calendar_date, db.trip],
            where: {
              service_id: 'christmas'
            }
          })
          .then(function (data) {
            // existence of record
            assert.isAbove(data.length, 0)

            assert.strictEqual(data[0].end_date, '20151225')

            done()
          })
          .catch(done)
      })
    })

    it('should load into a specific schema', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.downloadsDir = 'tests'
      config.gtfsFileOrFolder = 'mock_agency'
      config.sequelizeOptions.logging = false
      config.sequelizeOptions.schema = 'test_schema'

      var gtfs = GTFS(config)

      gtfs.loadGtfs(done)
    })

    it('should load a gtfs with only calendar_dates.txt', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.gtfsFileOrFolder = 'feed_with_only_calendar_dates'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(done)
    })

    it('should load a gtfs without calendar_dates.txt', function (done) {
      var config = util.getConfig()
      this.timeout(config.maxLoadTimeout)

      config.gtfsFileOrFolder = 'feed_with_only_calendar'

      var gtfs = GTFS(config)
      gtfs.loadGtfs(done)
    })
  })
})
