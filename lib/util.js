var util = {};

util.getConnectionString = function(sequelize) {
  return sequelize.getDialect() + '://' + 
    sequelize.config.username + ':' +
    sequelize.config.password + '@' +
    sequelize.config.host + ':' +
    sequelize.config.port + '/' +
    sequelize.config.database;
}

util.makeInserterConfig = function(model) {
  return {
    dbConnString: util.getConnectionString(model.sequelize),
    tableName: model.tableName,
    columns: Object.keys(model.attributes)
  };
}

module.exports = util;