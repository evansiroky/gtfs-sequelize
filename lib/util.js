var util = {};

util.getConnectionString = function(sequelize) {
  return sequelize.getDialect() + '://' +
    sequelize.config.username + ':' +
    sequelize.config.password + '@' +
    sequelize.config.host + ':' +
    sequelize.config.port + '/' +
    sequelize.config.database;
}

util.makeStreamerConfig = function(model) {
  var dialect = model.sequelize.getDialect()
  var schema = model.sequelize.options.schema
  var config = {
    tableName: model.tableName,
    columns: Object.keys(model.attributes),
    primaryKey: Object.keys(model.primaryKeys)[0]
  };

  if (schema) {
    if (dialect === 'postgres') {
      config.tableName = '"' + schema + '"."' + model.tableName + '"'
    } else {
      config.tableName = '`' + schema + '.' + model.tableName + '`'
    }
  }

  if (dialect === 'sqlite') {
    config.sqliteStorage = model.sequelize.options.storage
  } else {
    config.dbConnString = util.getConnectionString(model.sequelize)
  }

  if(['mysql', 'sqlite'].indexOf(dialect) > -1) {
    config.deferUntilEnd = true;
  }

  // special case for fare rules
  // since I haven't found a way for sequelize to define tables with a composite primary key
  // that may have columns with null values, delete the auto-generated id column
  if(model.tableName === 'fare_rule') {
    config.columns.splice(config.columns.indexOf('id'), 1);
    if(dialect === 'sqlite' && !schema) {
      config.deferUntilEnd = false
    }
  }

  return config;
}

util.makeModelReference = function (sequelize, modelName) {
  if (sequelize.options.schema) {
    modelName = {
      schema: sequelize.options.schema,
      tableName: modelName
    }
  }
  return modelName
}

util.makeTableOptions = function(sequelize, options) {
  if (sequelize.options.schema) {
    options.schema = sequelize.options.schema
  }

  return options
}

module.exports = util;
