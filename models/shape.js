module.exports = function(sequelize, DataTypes) {
  return sequelize.define("shape", {
    shape_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    shape_pt_lat: DataTypes.FLOAT,
    shape_pt_lon: DataTypes.FLOAT,
    shape_pt_sequence: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    shape_dist_traveled: DataTypes.FLOAT
  }, {
    freezeTableName: true
  });
}