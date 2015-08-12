module.exports = function(sequelize, DataTypes) {
  return sequelize.define("stop", {
    stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    stop_code: DataTypes.STRING(20),
    stop_name: DataTypes.STRING(255),
    stop_desc: DataTypes.STRING(255),
    stop_lat: DataTypes.FLOAT,
    stop_lon: DataTypes.FLOAT,
    zone_id: DataTypes.STRING(255),
    stop_url: DataTypes.STRING(255),
    location_type: DataTypes.INTEGER,
    parent_station: DataTypes.INTEGER,
    stop_timezone: DataTypes.STRING(100),
    wheelchair_boarding: DataTypes.INTEGER
  });
}