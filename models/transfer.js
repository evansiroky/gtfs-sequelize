module.exports = function(sequelize, DataTypes) {
  var Transfer = sequelize.define("transfer", {
    from_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: "stop",
        key: "stop_id"
      }
    },
    to_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: "stop",
        key: "stop_id"
      }
    },
    transfer_type: DataTypes.INTEGER,
    min_transfer_time: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        Transfer.belongsTo(models.stop, {
          foreignKeyContraint: true, 
          foreignKey: "from_stop_id" 
        });

        Transfer.belongsTo(models.stop, {
          foreignKeyContraint: true, 
          foreignKey: "to_stop_id" 
        });

      }
    }
  });

  return Transfer;
}