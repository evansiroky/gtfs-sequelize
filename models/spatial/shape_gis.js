var util = require('../../lib/util')

module.exports = function(sequelize, DataTypes) {
  var ShapeGIS = sequelize.define("shape_gis", {
    shape_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    geom: DataTypes.GEOMETRY('LINESTRING', 4326)
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        ShapeGIS.hasMany(models.trip, {
          foreignKey: 'shape_id'
        });

      }
    }
  }));

  return ShapeGIS;
}
