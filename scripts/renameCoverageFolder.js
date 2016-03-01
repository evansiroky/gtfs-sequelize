var fs = require('fs');

var dialect = process.env.DIALECT

fs.rename('coverage', 'coverage-' + dialect, function(){});