module.exports = function(sequelize, DataTypes) {
  return sequelize.define("agency", {
    agency_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    agency_name: DataTypes.STRING(255),
    agency_url: DataTypes.STRING(255),
    agency_timezone: DataTypes.STRING(100),
    agency_lang: DataTypes.STRING(2),
    agency_phone: DataTypes.STRING(50),
    agency_fare_url: DataTypes.STRING(255),
  });
}