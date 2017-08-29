const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    Shapes describe the physical path that a vehicle takes, and are defined in
    the file shapes.txt. Shapes belong to Trips, and consist of a sequence of
    points. Tracing the points in order provides the path of the vehicle. The
    points do not need to match stop locations.

    Portions of this page are reproduced from work created and shared by Google
    and used according to terms described in the Creative Commons 3.0 Attribution License.
    https://developers.google.com/transit/gtfs/reference/shapes-file
  */
  const Shape = db.define('shape', {
    /*
      Contains an ID that uniquely identifies a shape.
    */
    shape_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    /*
      Associates a shape point's latitude with a shape ID. The field value must be a
      valid WGS 84 latitude. Each row in shapes.txt represents a shape point in your
      shape definition.

      For example, if the shape "A_shp" has three points in its definition, the
      shapes.txt file might contain these rows to define the shape:
      - A_shp,37.61956,-122.48161,0
      - A_shp,37.64430,-122.41070,6
      - A_shp,37.65863,-122.30839,11
    */
    shape_pt_lat: DataTypes.FLOAT(7),
    /*
      Associates a shape point's longitude with a shape ID. The field value must be a
      valid WGS 84 longitude value from -180 to 180. Each row in shapes.txt represents
      a shape point in your shape definition.

      For example, if the shape "A_shp" has three points in its definition, the shapes.txt
      file might contain these rows to define the shape:
      - A_shp,37.61956,-122.48161,0
      - A_shp,37.64430,-122.41070,6
      - A_shp,37.65863,-122.30839,11
    */
    shape_pt_lon: DataTypes.FLOAT(7),
    /*
      Associates the latitude and longitude of a shape point with its sequence order
      along the shape. The values for shape_pt_sequence must be non-negative integers,
      and they must increase along the trip.

      For example, if the shape "A_shp" has three points in its definition, the shapes.txt
      file might contain these rows to define the shape:
      - A_shp,37.61956,-122.48161,0
      - A_shp,37.64430,-122.41070,6
      - A_shp,37.65863,-122.30839,11
    */
    shape_pt_sequence: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    /*
      When used in the shapes.txt file, this field positions a shape point as a distance
      traveled along a shape from the first shape point. The shape_dist_traveled field
      represents a real distance traveled along the route in units such as feet or
      kilometers. This information allows the trip planner to determine how much of the
      shape to draw when showing part of a trip on the map. The values used
      forshape_dist_traveled must increase along with shape_pt_sequence: they cannot be
      used to show reverse travel along a route.

      The units used for shape_dist_traveled in the shapes.txt file must match the units
      that are used for this field in the stop_times.txt file.

      For example, if a bus travels along the three points defined above for A_shp, the
      additional shape_dist_traveled values (shown here in kilometers) would look like this:
      - A_shp,37.61956,-122.48161,0,0
      - A_shp,37.64430,-122.41070,6,6.8310
      - A_shp,37.65863,-122.30839,11,15.8765
    */
    shape_dist_traveled: DataTypes.FLOAT
  })

  Shape.filename = 'shapes.txt'

  return Shape
}
