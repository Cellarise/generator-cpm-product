"use strict";
var debug = require('debug')('loopback:mountExplorer');
module.exports = function mountLoopBackExplorer(server, cb) {
  var explorer, restApiRoot, explorerApp;

  //test require
  if (process.env.CELLARISE_ENV === "development") {
    try {
      explorer = require('loopback-explorer');
    } catch (err) {
      //only make available in dev environment
      if (!err) {
        restApiRoot = server.get('restApiRoot');
        explorerApp = explorer(server, {
          "basePath": restApiRoot
        });
        server.use('/explorer', explorerApp);
        debug('02 explorer - mounted');
      } else {
        debug('02 explorer - skipped');
      }
    }
  }
  cb();
};
