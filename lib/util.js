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
  var config = {
    dbConnString: util.getConnectionString(model.sequelize),
    tableName: model.tableName,
    columns: Object.keys(model.attributes),
    primaryKey: Object.keys(model.primaryKeys)[0]
  };

  if(model.sequelize.getDialect() == 'mysql') {
    config.deferUntilEnd = true;
  }
  
  return config;
}

module.exports = util;