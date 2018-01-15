const async = require('async')
const dbStreamer = require('db-streamer')

const util = require('./util')

/**
 * Make an update query to the db to set the interpolated times in
 * a particular range of a particular trip
 */
function updateInterpolatedTimes (cfg, callback) {
  const db = cfg.db
  const lastTimepoint = cfg.lastTimepoint
  const nextTimepoint = cfg.nextTimepoint
  const timeDiff = nextTimepoint.arrival_time - lastTimepoint.departure_time
  let literal
  // sqlite null is a string
  if (nextTimepoint.shape_dist_traveled && nextTimepoint.shape_dist_traveled !== 'NULL') {
    // calculate interpolation based off of distance ratios
    const distanceTraveled = nextTimepoint.shape_dist_traveled - lastTimepoint.shape_dist_traveled
    literal = `${lastTimepoint.departure_time} +
      ${timeDiff} *
      (shape_dist_traveled - ${lastTimepoint.shape_dist_traveled}) /
      ${distanceTraveled}`
  } else {
    // calculate interpolation based off of stop sequence ratios
    const numStopsPassed = nextTimepoint.stop_sequence - lastTimepoint.stop_sequence
    literal = `${lastTimepoint.departure_time} +
      ${timeDiff} *
      (stop_sequence - ${lastTimepoint.stop_sequence}) /
      ${numStopsPassed}`
  }
  const updateLiteral = db.sequelize.literal(literal)
  db.stop_time
    .update(
      {
        arrival_time: updateLiteral,
        departure_time: updateLiteral
      },
      {
        where: {
          trip_id: lastTimepoint.trip_id,
          stop_sequence: {
            $gt: lastTimepoint.stop_sequence,
            $lt: nextTimepoint.stop_sequence
          }
        }
      }
    )
    .then(() => {
      callback()
    })
    .catch(callback)
}

/**
 * Calculate and assign an approximate arrival and departure time
 * at all stop_times that have an undefined arrival and departure time
 */
function interpolateStopTimes (db, callback) {
  console.log('interpolating stop times')
  const streamerConfig = util.makeStreamerConfig(db.trip)
  const querier = dbStreamer.getQuerier(streamerConfig)
  const maxUpdateConcurrency = db.trip.sequelize.getDialect() === 'sqlite' ? 1 : 100
  const updateQueue = async.queue(updateInterpolatedTimes, maxUpdateConcurrency)
  let isComplete = false
  let numUpdates = 0

  /**
   * Helper function to call upon completion of interpolation
   */
  function onComplete (err) {
    if (err) {
      console.log('interpolation encountered an error: ', err)
      return callback(err)
    }
    // set is complete and create a queue drain function
    // however, a feed may not have any interpolated times, so
    // `isComplete` is set in case nothing is pushed to the queue
    isComplete = true
    updateQueue.drain = () => {
      console.log('interpolation completed successfully')
      callback(err)
    }
  }

  let rowTimeout

  /**
   * Helper function to account for stop_times that are completely interpolated
   */
  function onRowComplete () {
    if (rowTimeout) {
      clearTimeout(rowTimeout)
    }
    if (isComplete && numUpdates === 0) {
      rowTimeout = setTimeout(() => {
        // check yet again, because interpolated times could've appeared since setting timeout
        if (numUpdates === 0) {
          console.log('interpolation completed successfully (no interpolations needed)')
          callback()
        }
      }, 10000)
    }
  }

  // TODO: fix this cause it doesn't work w/ sqlite with a schema for some reason
  const statement = `SELECT trip_id FROM ${streamerConfig.tableName}`
  querier.execute(
    statement,
    row => {
      // get all stop_times for trip
      db.stop_time
        .findAll({
          where: {
            trip_id: row.trip_id
          }
        })
        // iterate through stop times to determine null arrival or departure times
        .then(stopTimes => {
          let lastStopTime
          let lastTimepoint
          let lookingForNextTimepoint = false

          stopTimes.forEach(stopTime => {
            if (lookingForNextTimepoint) {
              // check if current stop time has a time
              // mysql null stop times are showin up as 0, which might be bug elsewhere
              // sqlite null shows up as 'NULL'
              if (
                stopTime.arrival_time !== null &&
                stopTime.arrival_time !== 'NULL' &&
                stopTime.arrival_time >= lastTimepoint.departure_time
              ) {
                // found next timepoint
                // make update query to set interpolated times
                updateQueue.push({
                  db: db,
                  lastTimepoint: lastTimepoint,
                  nextTimepoint: stopTime
                })
                numUpdates++
                lookingForNextTimepoint = false
              }
            } else {
              // sqlite uninterpolated shows up ass 'NULL'
              if (stopTime.arrival_time === null || stopTime.arrival_time === 'NULL') {
                lastTimepoint = lastStopTime
                lookingForNextTimepoint = true
              }
            }
            lastStopTime = stopTime
          })
          onRowComplete()
        })
        .catch(onComplete)
    },
    onComplete
  )
}

module.exports = {
  interpolateStopTimes: interpolateStopTimes
}
