module.exports = function(sequelize, DataTypes) {
  return sequelize.define("calendar_date", {
    service_id: {
      type: DataTypes.STRING(255),
      primaryKey: true
    },
    date: {
      type: DataTypes.DATEONLY,
      primaryKey: true
    },
    exception_type: DataTypes.INTEGER
  });
}