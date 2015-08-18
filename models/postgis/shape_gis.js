module.exports = function(sequelize, DataTypes) {
  var ShapeGIS = sequelize.define("shape_gis", {
    shape_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    geom: DataTypes.GEOMETRY
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        ShapeGIS.hasMany(models.trip, {
          foreignKey: 'shape_id'
        });

      }
    }
  });

  return ShapeGIS;
}