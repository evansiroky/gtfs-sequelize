module.exports = function(sequelize, DataTypes) {
  return sequelize.define("trip", {
    route_id: DataTypes.STRING(255),
    service_id: DataTypes.STRING(255),
    trip_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    trip_headsign: DataTypes.STRING(255),
    trip_short_name: DataTypes.STRING(100),
    direction_id: DataTypes.INTEGER,
    block_id: DataTypes.STRING(255),
    shape_id: DataTypes.STRING(255),
    wheelchair_accessible: DataTypes.INTEGER,
    bikes_allowed: DataTypes.INTEGER
  });
}