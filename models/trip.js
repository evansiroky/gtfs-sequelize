const DataTypes = require('sequelize').DataTypes
const moment = require('moment-timezone')

module.exports = function (db) {
  /*
    A Trip represents a journey taken by a vehicle through Stops. Trips are
    time-specific — they are defined as a sequence of StopTimes, so a single
    Trip represents one journey along a transit line or route. In addition to
    StopTimes, Trips use Calendars to define the days when a Trip is available
    to passengers. Trips are defined in trips.txt.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/trips-file
  */
  const Trip = db.define('trip', {
    /*
      Contains an ID that uniquely identifies a route. This value is referenced
      from the routes.txt file.
    */
    route_id: {
      type: DataTypes.STRING(255)
    },
    /*
      The service_id contains an ID that uniquely identifies a set of dates when
      service is available for one or more routes. This value is referenced from
      the calendar.txt or calendar_dates.txt file.
    */
    service_id: {
      type: DataTypes.STRING(255)
    },
    /*
      Contains an ID that identifies a trip. The trip_id is dataset unique.
    */
    trip_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Contains the text that appears on a sign that identifies the trip's destination
      to passengers. Use this field to distinguish between different patterns of
      service in the same route. If the headsign changes during a trip, you can override
      the trip_headsign by specifying values for the the stop_headsign field in
      stop_times.txt.
    */
    trip_headsign: DataTypes.STRING(255),
    /*
      Contains the text that appears in schedules and sign boards to identify the trip to
      passengers, for example, to identify train numbers for commuter rail trips. If riders
      do not commonly rely on trip names, please leave this field blank.

      A trip_short_name value, if provided, should uniquely identify a trip within a service
      day; it should not be used for destination names or limited/express designations.
    */
    trip_short_name: DataTypes.STRING(100),
    /*
      Contains a binary value that indicates the direction of travel for a trip. Use this
      field to distinguish between bi-directional trips with the same route_id. This field
      is not used in routing; it provides a way to separate trips by direction when publishing
      time tables. You can specify names for each direction with the trip_headsign field.
      - 0: Travel in one direction (outbound travel)
      - 1: Travel in the opposite direction (inbound travel)

      For example, you could use the trip_headsign and direction_id fields together to assign
      a name to travel in each direction for a set of trips. A trips.txt file could contain
      these rows for use in time tables:
      - trip_id,...,trip_headsign,direction_id
      - 1234,...,to Airport,0
      - 1505,...,to Downtown,1
    */
    direction_id: DataTypes.INTEGER,
    /*
      Identifies the block to which the trip belongs. A block consists of two or more sequential
      trips made using the same vehicle, where a passenger can transfer from one trip to the next
      just by staying in the vehicle. The block_id must be referenced by two or more trips in
      trips.txt.
    */
    block_id: DataTypes.STRING(255),
    /*
      Contains an ID that defines a shape for the trip. This value is referenced from the shapes.txt
      file. The shapes.txt file allows you to define how a line should be drawn on the map to
      represent a trip.
    */
    shape_id: DataTypes.STRING(255),
    /*
      - 0 (or empty): Indicates that there is no accessibility information for the trip
      - 1: Indicates that the vehicle being used on this particular trip can accommodate
        at least one rider in a wheelchair
      - 2: Indicates that no riders in wheelchairs can be accommodated on this trip
    */
    wheelchair_accessible: DataTypes.INTEGER,
    /*
      - 0 (or empty): Indicates that there is no bike information for the trip
      - 1: Indicates that the vehicle being used on this particular trip can accommodate at least
        one bicycle
      - 2: Indicates that no bicycles are allowed on this trip
    */
    bikes_allowed: DataTypes.INTEGER
  })

  Trip.prototype.isRunningAt = function (datetime) {
    // TODO convert timezone
    // TODO cache value
    // TODO this could be done faster (but less cleanly) in the database
    const dateNumber = moment(datetime).format('YYYYMMDD')
    const normalOperation = db.models.calendar.findOne({
      where: {
        service_id: this.service_id,
        start_date: { $gte: dateNumber },
        end_date: { $lte: dateNumber }
      }
    })
    const exceptions = db.models.calendarDate.findAll({
      where: {
        service_id: this.service_id,
        date: dateNumber
      }
    })
    return Promise.all([normalOperation, exceptions]).then(res => {
      const normal = res[0]
      const dayOfWeek = moment(datetime).format('dddd').toLowerCase()
      const normallyOpen = normal[dayOfWeek]
      const openException = exceptions.filter(e => e.isOpen())[0]
      const closedException = exceptions.filter(e => !e.isOpen())[0]
      return (normallyOpen || openException) && !closedException
    })
  }

  Trip.filename = 'trips.txt'

  return Trip
}
