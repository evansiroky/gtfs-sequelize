const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    Trip planners normally calculate transfer points based on the relative proximity
    of stops in each route. For potentially ambiguous stop pairs, or transfers where
    you want to specify a particular choice, use transfers.txt to define additional
    rules for making connections between routes.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/transfers-file
  */
  const Transfer = db.define('transfer', {
    /*
      Contains a stop ID that identifies a stop or station where a connection between
      routes begins. Stop IDs are referenced from the stops.txt file. If the stop ID
      refers to a station that contains multiple stops, this transfer rule applies to
      all stops in that station.
    */
    from_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Contains a stop ID that identifies a stop or station where a connection between
      routes ends. Stop IDs are referenced from the stops.txt file. If the stop ID refers
      to a station that contains multiple stops, this transfer rule applies to all stops
      in that station.
    */
    to_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Specifies the type of connection for the specified (from_stop_id, to_stop_id) pair.
      Valid values for this field are:
      - 0 or (empty): This is a recommended transfer point between two routes.
      - 1: This is a timed transfer point between two routes. The departing vehicle is
        expected to wait for the arriving one, with sufficient time for a passenger to transfer
        between routes.
      - 2: This transfer requires a minimum amount of time between arrival and departure to
        ensure a connection. The time required to transfer is specified by min_transfer_time.
      - 3: Transfers are not possible between routes at this location.
    */
    transfer_type: DataTypes.INTEGER,
    /*
      When a connection between routes requires an amount of time between arrival and
      departure (transfer_type=2), this field defines the amount of time that must be
      available in an itinerary to permit a transfer between routes at these stops.
      The min_transfer_time must be sufficient to permit a typical rider to move between
      the two stops, including buffer time to allow for schedule variance on each route.

      The min_transfer_time value must be entered in seconds, and must be a non-negative integer.
    */
    min_transfer_time: DataTypes.INTEGER
  })

  return Transfer
}
