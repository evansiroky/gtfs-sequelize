const DataTypes = require('sequelize').DataTypes

module.exports = function (db) {
  /*
    For databases that support GIS, this is a table containing
    line info for shapes.
  */
  const ShapeGIS = db.define('shape_gis', {
    shape_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    geom: DataTypes.GEOMETRY('LINESTRING', 4326)
  })

  return ShapeGIS
}
