const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    A stop is a location where vehicles stop to pick up or drop off passengers.
    Stops are defined in the file stops.txt. Stops can be grouped together, such
    as when there are multiple stops within a single station. This is done by
    defining one Stop for the station, and defining it as a parent for all the
    Stops it contains. Stops may also have zone identifiers, to group them
    together into zones. This can be used together with FareAttributes and
    FareRules for zone-based ticketing.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/stops-file
  */
  const Stop = db.define('stop', Object.assign({
    /*
      Contains an ID that uniquely identifies a stop or station. Multiple routes
      may use the same stop. The stop_id is dataset unique.
    */
    stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Contains short text or a number that uniquely identifies the stop for passengers.
      Stop codes are often used in phone-based transit information systems or printed
      on stop signage to make it easier for riders to get a stop schedule or real-time
      arrival information for a particular stop.

      The stop_code field should only be used for stop codes that are displayed to
      passengers. For internal codes, use stop_id. This field should be left blank for
      stops without a code.
    */
    stop_code: DataTypes.STRING(20),
    /*
      Contains the name of a stop or station. Please use a name that people will
      understand in the local and tourist vernacular.
    */
    stop_name: DataTypes.STRING(255),
    /*
      Contains a description of a stop. Please provide useful, quality information.
      Do not simply duplicate the name of the stop.
    */
    stop_desc: DataTypes.STRING(255),
    /*
      Contains the latitude of a stop or station. The field value must be a valid
      WGS 84 latitude.
    */
    stop_lat: DataTypes.FLOAT(7),
    /*
      Contains the longitude of a stop or station. The field value must be a valid
      WGS 84 longitude value from -180 to 180.
    */
    stop_lon: DataTypes.FLOAT(7),
    /*
      Defines the fare zone for a stop ID. Zone IDs are required if you want to
      provide fare information using fare_rules.txt. If this stop ID represents a
      station, the zone ID is ignored.
    */
    zone_id: DataTypes.STRING(255),
    /*
      Contains the URL of a web page about a particular stop. This should be
      different from the agency_url and the route_url fields.

      The value must be a fully qualified URL that includes http:// or https://,
      and any special characters in the URL must be correctly escaped. See
      http://www.w3.org/Addressing/URL/4_URI_Recommentations.html for a description
      of how to create fully qualified URL values.
    */
    stop_url: DataTypes.STRING(255),
    /*
      Identifies whether this stop ID represents a stop or station. If no location
      type is specified, or the location_type is blank, stop IDs are treated as stops.
      Stations can have different properties from stops when they are represented on a
      map or used in trip planning.

      The location type field can have the following values:
      - 0 or blank: Stop. A location where passengers board or disembark from a transit vehicle.
      - 1: Station. A physical structure or area that contains one or more stop.
    */
    location_type: DataTypes.INTEGER,
    /*
      For stops that are physically located inside stations, this field identifies the
      station associated with the stop. To use this field, stops.txt must also contain
      a row where this stop ID is assigned location type=1.

      This stop ID represents               This entry's location type...   This entry's parent_station field contains...
      =======================               =============================   =============================================
      - A stop located inside a station.    0 or blank                      The stop ID of the station where this stop is
                                                                              located. The stop referenced by parent_station
                                                                              must have location_type=1.
      - A stop located outside a station.   0 or blank                      A blank value. The parent_station field doesn't
                                                                              apply to this stop.
      - A station.                          1                               A blank value. Stations can't contain other stations.
    */
    parent_station: DataTypes.STRING(255),
    /*
      Contains the timezone in which this stop or station is located. Please refer
      to Wikipedia List of Timezones for a list of valid values. If omitted, the
      stop should be assumed to be located in the timezone specified by
      agency_timezone in agency.txt.

      When a stop has a parent station, the stop is considered to be in the timezone
      specified by the parent station's stop_timezone value. If the parent has no
      stop_timezone value, the stops that belong to that station are assumed to be
      in the timezone specified by agency_timezone, even if the stops have their own
      stop_timezone values. In other words, if a given stop has a parent_station value,
      any stop_timezone value specified for that stop must be ignored.

      Even if stop_timezone values are provided in stops.txt, the times in stop_times.txt
      should continue to be specified as time since midnight in the timezone specified by
      agency_timezone in agency.txt. This ensures that the time values in a trip always
      increase over the course of a trip, regardless of which timezones the trip crosses.
    */
    stop_timezone: DataTypes.STRING(100),
    /*
      Identifies whether wheelchair boardings are possible from the specified stop or
      station. The field can have the following values:
      - 0 (or empty): Indicates that there is no accessibility information for the stop
      - 1: Indicates that at least some vehicles at this stop can be boarded by a rider
        in a wheelchair
      - 2: Wheelchair boarding is not possible at this stop

      When a stop is part of a larger station complex, as indicated by a stop with a
      parent_station value, the stop's wheelchair_boarding field has the following
      additional semantics:
      - 0 (or empty): The stop will inherit its wheelchair_boarding value from the parent
        station, if specified in the parent
      - 1: There exists some accessible path from outside the station to the specific
        stop / platform
      - 2: There exists no accessible path from outside the station to the specific
        stop/platform
    */
    wheelchair_boarding: DataTypes.INTEGER
  }, db.gisEnabled ? {
    /*
      If GIS is enabled for this database, include GIS point column
    */
    geom: DataTypes.GEOMETRY('POINT', 4326)
  } : {}))

  Stop.LocationType = {
    STOP: 0,
    STATION: 1
  }

  Stop.WheelchairAccessability = {
    UNKNOWN: 0,
    ACCESSABLE: 1,
    UNACCESSABLE: 2
  }

  Stop.filename = 'stops.txt'

  return Stop
}
