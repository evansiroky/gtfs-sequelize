var pgConfig = {
  database: 'postgres://gtfs_sequelize:gtfs_sequelize@localhost:5432/gtfs-sequelize-test',
  downloadsDir: 'downloads',
  gtfsFilename: 'google_transit.zip',
  sequelizeOptions: {
    logging: false
  }
}

describe('pg-load', function() {
  it('should load', function(done) {
    this.timeout(60000);
    var gtfs = require('../index.js')(pgConfig);
    gtfs = gtfs.loadGtfs(done);
    setTimeout(done, 59800);
  });
});