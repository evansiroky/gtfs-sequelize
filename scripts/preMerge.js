var fs = require('fs'),
  rimraf = require('rimraf');

rimraf('coverage', function(err) {
  if(err) throw new Error(err);
  fs.mkdir('coverage', function(){});
})