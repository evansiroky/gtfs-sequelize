module.exports = function(sequelize, DataTypes) {
  var Stop = sequelize.define("stop", {
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
    parent_station: DataTypes.STRING(255),
    stop_timezone: DataTypes.STRING(100),
    wheelchair_boarding: DataTypes.INTEGER
  }, {
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
  });

  return Stop;
}