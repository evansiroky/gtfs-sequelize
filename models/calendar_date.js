module.exports = function(sequelize, DataTypes) {
  var CalendarDate = sequelize.define("calendar_date", {
    service_id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      references: {
        model: "calendar",
        key: "service_id"
      }
    },
    date: {
      type: DataTypes.STRING(8),
      primaryKey: true
    },
    exception_type: DataTypes.INTEGER
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        CalendarDate.belongsTo(models.calendar, {
          foreignKeyContraint: true,
          foreignKey: "service_id"
        });
      }
    }
  });

  return CalendarDate;
}
