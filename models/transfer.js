module.exports = function(sequelize, DataTypes) {
  return sequelize.define("transfer", {
    from_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    to_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    transfer_type: DataTypes.INTEGER,
    min_transfer_time: DataTypes.INTEGER
  });
}