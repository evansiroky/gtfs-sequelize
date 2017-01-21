var util = require('../lib/util')

module.exports = function(sequelize, DataTypes) {
  var Transfer = sequelize.define("transfer", {
    from_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: util.makeModelReference(sequelize, "stop"),
        key: "stop_id"
      }
    },
    to_stop_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: util.makeModelReference(sequelize, "stop"),
        key: "stop_id"
      }
    },
    transfer_type: DataTypes.INTEGER,
    min_transfer_time: DataTypes.INTEGER
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        Transfer.belongsTo(models.stop, {
          as: 'from_stop',
          foreignKeyContraint: true,
          foreignKey: 'from_stop_id',
          targetKey: 'stop_id'
        });

        Transfer.belongsTo(models.stop, {
          as: 'to_stop',
          foreignKeyContraint: true,
          foreignKey: 'to_stop_id',
          targetKey: 'stop_id'
        });

      }
    }
  }));

  return Transfer;
}
