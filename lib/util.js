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

  // special case for fare rules
  // since I haven't found a way for sequelize to define tables with a composite primary key
  // that may have columns with null values, delete the auto-generated id column
  if(model.tableName === 'fare_rule') {
    config.columns.splice(config.columns.indexOf('id'), 1);
  }

  if(model.sequelize.getDialect() == 'mysql') {
    config.deferUntilEnd = true;
  }
  
  return config;
}

module.exports = util;