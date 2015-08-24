"use strict";
var debug = require('debug')('loopback:databaseCheck');
var checkEnv = require('../scripts/checkEnvironment');
module.exports = function databaseCheck(app, cb) {
  var dataSource = app.dataSources.db;
  var vasync = require("vasync");
  vasync.pipeline({
    'funcs': [
      function databaseUpdateOrMigrate(_, callback) {
        if (checkEnv.isNonDevEnvironment()) {
          //INFO: Update table schemas ONLY
          dataSource.autoupdate(callback);
          debug('01 Database check - autoupdate');
        } else {
          //WARNING: Will drop tables and recreate
          dataSource.automigrate(callback);
          debug('01 Database check - automigrate');
        }
      }
    ]
  }, cb);
};
