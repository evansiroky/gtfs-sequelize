module.exports = {
  quitOnError: function(e) {
    console.error(e || 'Unknown Error');
    process.exit(1);
  }
};