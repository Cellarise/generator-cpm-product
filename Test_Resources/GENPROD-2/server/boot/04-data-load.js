"use strict";
var vasync = require("vasync");
var _ = require('underscore');
var DataLoader = require("../dataLoader");
var debug = require('debug')('loopback:dataLoad');
module.exports = function dataLoad(app, cb) {

  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "QA") {
    debug('04 data load - skipped');
    cb();
  } else {
    vasync.pipeline({
      'funcs': []
    }, function done(err) {
      if (err) {
        debug('error: %s', err.message);
      }
      debug('04 data load - complete');
      cb();
    });
  }
};
