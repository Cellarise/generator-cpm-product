"use strict";
var debug = require('debug')('loopback:mountRestAPI');
module.exports = function mountRestAPI(server, cb) {
  var restApiRoot = server.get('restApiRoot');
  server.use(restApiRoot, server.loopback.rest());
  debug('02 api - mounted');
  cb();
};
