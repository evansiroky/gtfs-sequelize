var util = require('../lib/util')

module.exports = function(sequelize, DataTypes) {
  var Frequency = sequelize.define("frequency", {
    trip_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: util.makeModelReference(sequelize, "trip"),
        key: "trip_id"
      }
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
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {

        Frequency.belongsTo(models.trip, {
          foreignKeyContraint: true,
          foreignKey: "trip_id"
        });

      }
    }
  }));

  return Frequency;
}
