const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    GTFS Routes are equivalent to "Lines" in public transportation systems.
    Routes are defined in the file routes.txt, and are made up of one or more
    Trips — remember that a Trip occurs at a specific time and so a Route is
    time-independent.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/routes-file
  */
  const Route = db.define('route', {
    /*
      Contains an ID that uniquely identifies a route. The route_id is dataset unique.
    */
    route_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Defines an agency for the specified route. This value is referenced from
      the agency.txt file. Use this field when you are providing data for routes
      from more than one agency.
    */
    agency_id: {
      type: DataTypes.STRING(255)
    },
    /*
      Contains the short name of a route. This will often be a short, abstract
      identifier like "32", "100X", or "Green" that riders use to identify a route,
      but which doesn't give any indication of what places the route serves.

      At least one of route_short_name or route_long_name must be specified, or
      potentially both if appropriate. If the route does not have a short name,
      please specify a route_long_name and use an empty string as the value for
      this field.
    */
    route_short_name: DataTypes.STRING(50),
    /*
      Contains the full name of a route. This name is generally more descriptive
      than the route_short_name and will often include the route's destination or
      stop. At least one of route_short_name or route_long_name must be specified,
      or potentially both if appropriate. If the route does not have a long name,
      please specify a route_short_name and use an empty string as the value for
      this field.
    */
    route_long_name: DataTypes.STRING(255),
    /*
      Contains a description of a route. Please provide useful, quality information.
      Do not simply duplicate the name of the route. For example, "A trains operate
      between Inwood-207 St, Manhattan and Far Rockaway-Mott Avenue, Queens at all
      times. Also from about 6AM until about midnight, additional A trains operate
      between Inwood-207 St and Lefferts Boulevard (trains typically alternate between
      Lefferts Blvd and Far Rockaway)."
    */
    route_desc: DataTypes.STRING(255),
    /*
      Describes the type of transportation used on a route. Valid values for this field are:
      - 0: Tram, Streetcar, Light rail. Any light rail or street level system within a
        metropolitan area.
      - 1: Subway, Metro. Any underground rail system within a metropolitan area.
      - 2: Rail. Used for intercity or long-distance travel.
      - 3: Bus. Used for short- and long-distance bus routes.
      - 4: Ferry. Used for short- and long-distance boat service.
      - 5: Cable car. Used for street-level cable cars where the cable runs beneath the car.
      - 6: Gondola, Suspended cable car. Typically used for aerial cable cars where the car
        is suspended from the cable.
      - 7: Funicular. Any rail system designed for steep inclines.
    */
    route_type: DataTypes.INTEGER,
    /*
      Contains the URL of a web page about that particular route. This should be different
      from the agency_url.

      The value must be a fully qualified URL that includes http:// or https://, and any
      special characters in the URL must be correctly escaped. See
      http://www.w3.org/Addressing/URL/4_URI_Recommentations.html for a description of how
      to create fully qualified URL values.
    */
    route_url: DataTypes.STRING(255),
    /*
      In systems that have colors assigned to routes, this defines a color that corresponds
      to a route. The color must be provided as a six-character hexadecimal number, for example,
      00FFFF. If no color is specified, the default route color is white (FFFFFF).

      The color difference between route_color and route_text_color should provide sufficient
      contrast when viewed on a black and white screen. The W3C Techniques for Accessibility
      Evaluation And Repair Tools document offers a useful algorithm for evaluating color
      contrast. There are also helpful online tools for choosing contrasting colors, including
      the snook.ca Color Contrast Check application.
    */
    route_color: DataTypes.STRING(255),
    /*
      Specifies a legible color to use for text drawn against a background of route_color.
      The color must be provided as a six-character hexadecimal number, for example, FFD700.
      If no color is specified, the default text color is black (000000).

      The color difference between route_color and route_text_color should provide sufficient
      contrast when viewed on a black and white screen.
    */
    route_text_color: DataTypes.STRING(255)
  })

  Route.Types = {
    LIGHT_RAIL: 0,
    SUBWAY: 1,
    RAIL: 2,
    BUS: 3,
    FERRY: 4,
    CABLE_CAR: 5,
    GONDOLA: 6,
    FUNICULAR: 7
  }

  Route.filename = 'routes.txt'

  return Route
}
