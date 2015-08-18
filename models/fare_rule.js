module.exports = function(sequelize, DataTypes) {
  var FareRule = sequelize.define("fare_rule", {
    fare_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: "fare_attribute",
        key: "fare_id"
      }
    },
    route_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    origin_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    destination_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    contains_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    }
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