var util = require('../lib/util')

module.exports = function(sequelize, DataTypes) {
  var Route = sequelize.define("route", {
    route_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    agency_id: {
      type: DataTypes.STRING(255),
      references: {
        model: util.makeModelReference(sequelize, 'agency'),
        key: "agency_id"
      }
    },
    route_short_name: DataTypes.STRING(50),
    route_long_name: DataTypes.STRING(255),
    route_desc: DataTypes.TEXT,
    route_type: DataTypes.INTEGER,
    route_url: DataTypes.STRING(255),
    route_color: DataTypes.STRING(255),
    route_text_color: DataTypes.STRING(255)
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        Route.belongsTo(models.agency, {
          foreignKeyContraint: true,
          foreignKey: "agency_id"
        });

        Route.hasMany(models.trip, {
          foreignKey: 'route_id'
        });

        /* Don't fully understand how to get these working with sequelize yet
        Route.hasMany(models.fare_rule, {
          foreignKey: 'route_id'
        });
        */

      }
    }
  }));

  return Route;
}
