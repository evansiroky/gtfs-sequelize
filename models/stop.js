var util = require('../lib/util')

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
    parent_station: DataTypes.STRING(255),
    stop_timezone: DataTypes.STRING(100),
    wheelchair_boarding: DataTypes.INTEGER
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        Stop.hasMany(models.stop_time, {
          foreignKey: 'stop_id'
        });

        /* Don't fully understand how to get these working with sequelize yet
        Stop.hasMany(models.fare_rule, {
          as: 'fare_rule_origins',
          foreignKey: 'zone_id',
          targetKey: 'origin_id'
        });

        Stop.hasMany(models.fare_rule, {
          as: 'fare_rule_destinations',
          foreignKey: 'zone_id',
          targetKey: 'destination_id'
        });

        Stop.hasMany(models.fare_rule, {
          as: 'fare_rule_contains',
          foreignKey: 'zone_id',
          targetKey: 'contains_id'
        });

        Stop.hasMany(models.transfer, {
          as: 'transfer_from_stops',
          foreignKey: 'stop_id',
          targetKey: 'from_stop_id'
        });

        Stop.hasMany(models.transfer, {
          as: 'transfer_to_stops',
          foreignKey: 'stop_id',
          targetKey: 'to_stop_id'
        });*/

      }
    }
  }));

  return Stop;
}
