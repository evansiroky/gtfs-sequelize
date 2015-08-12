module.exports = function(sequelize, DataTypes) {
  return sequelize.define("route", {
    route_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    agency_id: DataTypes.STRING(255),
    route_short_name: DataTypes.STRING(50),
    route_long_name: DataTypes.STRING(255),
    route_desc: DataTypes.STRING(255),
    route_type: DataTypes.INTEGER,
    route_url: DataTypes.STRING(255),
    route_color: DataTypes.STRING(255),
    route_text_color: DataTypes.STRING(255)
  });
}