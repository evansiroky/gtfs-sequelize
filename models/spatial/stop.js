var util = require('../../lib/util')

module.exports = function(sequelize, DataTypes) {
  var Stop = sequelize.define("stop", {
    stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    stop_code: DataTypes.STRING(20),
    stop_name: DataTypes.STRING(255),
    stop_desc: DataTypes.TEXT,
    stop_lat: DataTypes.FLOAT(7),
    stop_lon: DataTypes.FLOAT(7),
    zone_id: DataTypes.STRING(255),
    stop_url: DataTypes.STRING(255),
    location_type: DataTypes.INTEGER,
    parent_station: DataTypes.INTEGER,
    stop_timezone: DataTypes.STRING(100),
    wheelchair_boarding: DataTypes.INTEGER,
    geom: DataTypes.GEOMETRY('POINT', 4326)
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        Stop.hasMany(models.stop_time, {
          foreignKey: 'stop_id'
        });

        Stop.hasMany(models.transfer, {
          foreignKey: 'from_stop_id'
        });

        Stop.hasMany(models.transfer, {
          foreignKey: 'to_stop_id'
        });

      }
    }
  }));

  return Stop;
}
