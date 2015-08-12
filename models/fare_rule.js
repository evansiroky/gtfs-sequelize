module.exports = function(sequelize, DataTypes) {
  return sequelize.define("fare_rule", {
    fare_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    route_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    origin_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    destination_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    contains_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    }
  });
}