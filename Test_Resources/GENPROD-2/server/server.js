"use strict";
var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();

//declare app.start method
app.start = function appStart() {
  // start the web server
  // Overide loopback setting of port because loopback requires a finite number otherwise it defaults to 3000.
  // However, Azure provides a pipe string on process.env.PORT which loopback ignores.  Therefore we set it here.
  app.set('port', process.env.PORT || 3000);
  return app.listen(function listen() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

//boot script for loopback and associated middleware
boot(app, __dirname, function boot(err) {
  if (err) {
    throw err;
  }
  app.emit('ready');
  app.start();
});
