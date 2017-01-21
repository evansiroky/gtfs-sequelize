var util = require('../lib/util')

module.exports = function(sequelize, DataTypes) {
  var FareAttribute = sequelize.define("fare_attribute", {
    fare_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    price: DataTypes.FLOAT,
    currency_type: DataTypes.STRING(3),
    payment_method: DataTypes.INTEGER,
    transfers: DataTypes.INTEGER,
    transfer_duration: DataTypes.INTEGER
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        FareAttribute.hasMany(models.fare_rule, {
          foreignKey: 'fare_id'
        });
      }
    }
  }));

  return FareAttribute;
}
