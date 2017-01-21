var util = require('../lib/util')

module.exports = function(sequelize, DataTypes) {
  var CalendarDate = sequelize.define("calendar_date", {
    service_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: util.makeModelReference(sequelize, "calendar"),
        key: "service_id"
      }
    },
    date: {
      type: DataTypes.STRING(8),
      primaryKey: true
    },
    exception_type: DataTypes.INTEGER
  }, util.makeTableOptions(sequelize, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        CalendarDate.belongsTo(models.calendar, {
          foreignKeyContraint: true,
          foreignKey: "service_id"
        });
      }
    }
  }));

  return CalendarDate;
}
