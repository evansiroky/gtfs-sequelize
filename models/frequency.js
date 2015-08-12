module.exports = function(sequelize, DataTypes) {
  return sequelize.define("frequency", {
    trip_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    start_time: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    end_time: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    headway_secs: DataTypes.INTEGER,
    exact_times: DataTypes.INTEGER
  });
}