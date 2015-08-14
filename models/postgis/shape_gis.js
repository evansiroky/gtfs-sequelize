module.exports = function(sequelize, DataTypes) {
  return sequelize.define("shape_gis", {
    shape_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    geom: DataTypes.GEOMETRY
  });
}