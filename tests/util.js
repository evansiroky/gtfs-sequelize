var fs = require('fs'),
  path = require('path');

var yazl = require("yazl");


var zipMockAgency = function(callback) {

  // make a gtfs zip file from the mock data and put it in the downloads directory
  var zipfile = new yazl.ZipFile();

  // add all files in mock agency folder
  var zipSourceDir = 'tests/mock_agency';
  fs.readdirSync(zipSourceDir)
    .forEach(function(file) {
      zipfile.addFile(path.join(zipSourceDir, file), file)
    });

  try {
    fs.mkdirSync('downloads');
  } catch(e) {
    if ( e.code != 'EEXIST' ){ 
      callback(e);
    }
  }

  zipfile.outputStream.pipe(fs.createWriteStream(path.join('downloads', 'mock_gtfs.zip'))).on("close", function() {
    callback();
  });

  zipfile.end();

}

module.exports = {
  zipMockAgency: zipMockAgency
}