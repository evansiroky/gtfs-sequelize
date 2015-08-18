module.exports = function(sequelize, DataTypes) {
  var Calendar = sequelize.define("calendar", {
    service_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    monday: DataTypes.INTEGER,
    tuesday: DataTypes.INTEGER,
    wednesday: DataTypes.INTEGER,
    thursday: DataTypes.INTEGER,
    friday: DataTypes.INTEGER,
    saturday: DataTypes.INTEGER,
    sunday: DataTypes.INTEGER,
    start_date: DataTypes.DATEONLY,
    end_date: DataTypes.DATEONLY
  }, {
    freezeTableName: true,
    classMethods: {
      associate: function (models) {
        Calendar.hasMany(models.calendar_date, {
          foreignKey: 'service_id'
        });
      }
    }
  });

  return Calendar;
}