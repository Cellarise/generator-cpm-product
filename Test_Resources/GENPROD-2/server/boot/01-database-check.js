"use strict";
var debug = require('debug')('loopback:databaseCheck');
module.exports = function databaseCheck(app, cb) {
  var dataSource = app.dataSources.db;
  //create models
  var vasync = require("vasync");
  vasync.waterfall([
    function databaseUpdateOrMigrate(callback) {
      if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "QA") {
        //INFO: Update table schemas ONLY
        dataSource.autoupdate(callback);
        debug('01 Database check - autoupdate');
      } else {
        //WARNING: Will drop tables and recreate
        dataSource.automigrate(callback);
        debug('01 Database check - automigrate');
      }
    }
  ], function () {
    debug('01 Database check - complete');
    cb();
  });
};
