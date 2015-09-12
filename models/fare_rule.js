module.exports = function(sequelize, DataTypes) {
  var FareRule = sequelize.define("fare_rule", {
    fare_id: {
      type: DataTypes.STRING(255),
      references: {
        model: "fare_attribute",
        key: "fare_id"
      }
    },
    route_id: DataTypes.STRING(255),
    origin_id: DataTypes.STRING(255),
    destination_id: DataTypes.STRING(255),
    contains_id: DataTypes.STRING(255),
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        
        FareRule.belongsTo(models.fare_attribute, {
          foreignKeyContraint: true, 
          foreignKey: "fare_id" 
        });
      }
    }
  });

  return FareRule;
}