"use strict";
var debug = require('debug')('loopback:mountExplorer');
module.exports = function mountLoopBackExplorer(server, cb) {
  var explorer = require('loopback-explorer');
  var restApiRoot;
  var explorerApp;

  //only make available in dev environment
  if (process.env.NODE_ENV === "development") {
    restApiRoot = server.get('restApiRoot');
    explorerApp = explorer(server, {
      "basePath": restApiRoot
    });
    server.use('/explorer', explorerApp);
    debug('02 explorer - mounted');
  } else {
    debug('02 explorer - skipped');
  }
  cb();
};
