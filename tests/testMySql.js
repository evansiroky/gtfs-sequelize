var Promise = require('bluebird');

var mySqlConfig = {
  database: 'mysql://gtfs_sequelize:gtfs_sequelize@localhost:3306/gtfs-sequelize-test',
  downloadsDir: 'downloads',
  gtfsFileOrFolder: 'google_transit.zip',
  sequelizeOptions: {
    logging: false
  }
}

describe('mysql', function() {
  it('data should load', function() {
    this.timeout(300000);
    
    var gtfs = require('../index.js')(mySqlConfig),
      promise = Promise.promisify(gtfs.loadGtfs);

    return promise();
    
  });
});