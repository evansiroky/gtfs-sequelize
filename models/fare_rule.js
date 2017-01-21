var util = require('../lib/util')

module.exports = function(sequelize, DataTypes) {
  var FareRule = sequelize.define("fare_rule", {
    fare_id: {
      type: DataTypes.STRING(255),
      references: {
        model: util.makeModelReference(sequelize, "fare_attribute"),
        key: "fare_id"
      }
    },
    route_id: DataTypes.STRING(255),
    origin_id: DataTypes.STRING(255),
    destination_id: DataTypes.STRING(255),
    contains_id: DataTypes.STRING(255)
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        FareRule.belongsTo(models.fare_attribute, {
          foreignKeyContraint: true,
          foreignKey: "fare_id"
        });

        /* Don't fully understand how to get these working with sequelize yet
        FareRule.belongsTo(models.route, {
          foreignKey: 'route_id',
          constraints: false
        });

        FareRule.belongsTo(models.stop, {
          as: 'origin_stop',
          foreignKey: 'origin_id',
          targetKey: 'zone_id',
          constraints: false
        });

        FareRule.belongsTo(models.stop, {
          as: 'destination_stop',
          foreignKey: 'destination_id',
          targetKey: 'zone_id',
          constraints: false
        });

        FareRule.belongsTo(models.stop, {
          as: 'contains_stop',
          foreignKey: 'contains_id',
          targetKey: 'zone_id',
          constraints: false
        });*/

      }
    }
  }));

  return FareRule;
}
