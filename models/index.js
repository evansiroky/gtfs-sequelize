// copied from https://github.com/sequelize/express-example
var fs = require("fs"),
  path = require("path"),
  Sequelize = require("sequelize");

module.exports = function(config, options) {
  options = options || {}
  if(typeof config === 'string' || config instanceof String) {
    var sequelize = new Sequelize(config, options);
  } else if(!config && options) {
    var sequelize = new Sequelize(options);
  } else if(config.database) {
    var sequelize = new Sequelize(config.database, config.username, config.password, options);
  } else {
    console.log(typeof config);
    console.log(config instanceof String);
    var err = Error('invalid database config');
    throw err;
  }

  var db = {};

  fs.readdirSync(__dirname)
    .filter(function(file) {
      return (file.indexOf(".") > 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      var model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
    });

  Object.keys(db).forEach(function(modelName) {
    if ("associate" in db[modelName]) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;

  return db;
}
