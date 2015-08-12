module.exports = function(sequelize, DataTypes) {
  return sequelize.define("calendar", {
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
  });
}