module.exports = function(sequelize, DataTypes) {
  return sequelize.define("stop_time", {
    trip_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    arrival_time: DataTypes.INTEGER,
    departure_time: DataTypes.INTEGER,
    stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    stop_sequence: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    stop_headsign: DataTypes.STRING(255),
    pickup_type: DataTypes.INTEGER,
    drop_off_type: DataTypes.INTEGER,
    shape_dist_traveled: DataTypes.FLOAT,
    timepoint: DataTypes.INTEGER,
  });
}