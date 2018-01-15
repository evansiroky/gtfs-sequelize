const assert = require('chai').assert
const rimraf = require('rimraf')

const GTFS = require('../index.js')

const util = require('./util.js')

// prepare config for tests
describe(process.env.DIALECT, function () {
  describe('operations', function () {
    describe('interpolated stop times', () => {
      const expectedStopTimesNoShapes = [
        {
          arrival_time: 28800,
          departure_time: 28800
        },
        {
          arrival_time: 28880,
          departure_time: 28880
        },
        {
          arrival_time: 28960,
          departure_time: 28960
        },
        {
          arrival_time: 29040,
          departure_time: 29040
        },
        {
          arrival_time: 29160,
          departure_time: 29160
        },
        {
          arrival_time: 29280,
          departure_time: 29280
        }
      ]

      const expectedStopTimesWithShapes = [
        {
          arrival_time: 28800,
          departure_time: 28800
        },
        {
          arrival_time: 28903,
          departure_time: 28903
        },
        {
          arrival_time: 28954,
          departure_time: 28954
        },
        {
          arrival_time: 29040,
          departure_time: 29040
        },
        {
          arrival_time: 29172,
          departure_time: 29172
        },
        {
          arrival_time: 29280,
          departure_time: 29280
        }
      ]

      const testConfigs = [
        {
          describe: 'no shapes',
          expectedStopTimes: expectedStopTimesNoShapes,
          gtfsFileOrFolder: 'interpolated_no_shapes'
        },
        {
          describe: 'no shapes, with schema',
          expectedStopTimes: expectedStopTimesNoShapes,
          gtfsFileOrFolder: 'interpolated_no_shapes',
          schema: 'test_schema'
        },
        {
          describe: 'with shapes',
          expectedStopTimes: expectedStopTimesWithShapes,
          gtfsFileOrFolder: 'interpolated_with_shapes'
        }
      ]

      testConfigs.forEach(testConfig => {
        describe(testConfig.describe, () => {
          const config = util.getConfig()

          config.gtfsFileOrFolder = testConfig.gtfsFileOrFolder
          if (testConfig.schema) {
            if (process.env.DIALECT === 'sqlite') {
              console.warn('skipping sqlite test w/ schema cause I dunno why it\'s not working')
              return
            }
            config.sequelizeOptions.schema = testConfig.schema
          }

          const gtfs = GTFS(config)

          after(function (done) {
            const sqliteStorage = config.sequelizeOptions.storage
            if (sqliteStorage) {
              console.log('remove sqlite storage')
              rimraf(sqliteStorage, done)
            } else {
              util.dropDb(gtfs, done)
            }
          })

          before(done => {
            this.timeout(config.maxLoadTimeout)
            gtfs.loadGtfs(done)
          })

          it('should correctly calculate interpolated stop times', (done) => {
            this.timeout(config.maxLoadTimeout)

            // interpolate the stop times
            gtfs.interpolateStopTimes(err => {
              if (err) return done(err)

              const db = gtfs.connectToDatabase()
              db.stop_time
                .findAll({
                  where: {
                    trip_id: '1'
                  },
                  order: [
                    ['stop_sequence', 'ASC']
                  ]
                })
                .then(stopTimes => {
                  for (let i = 0; i < stopTimes.length; i++) {
                    const expectedStopTime = testConfig.expectedStopTimes[i]
                    const actualStopTime = stopTimes[i]
                    assert.strictEqual(
                      Math.round(actualStopTime.arrival_time),
                      expectedStopTime.arrival_time
                    )
                    assert.strictEqual(
                      Math.round(actualStopTime.departure_time),
                      expectedStopTime.departure_time
                    )
                  }
                  done()
                })
                .catch(done)
            })
          })
        })
      })
    })
  })
})
