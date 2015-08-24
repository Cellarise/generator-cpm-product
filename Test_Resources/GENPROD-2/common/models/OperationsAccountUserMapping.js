"use strict";
var debug = require('debug')('loopback:operationsAccountUserMapping');
var vasync = require('vasync');

module.exports = function operationsAccountUserMapping(OperationsAccountUserMapping) {

  OperationsAccountUserMapping.findAccount = function findAccount(token, next) {
    var Account = OperationsAccountUserMapping.app.models.OperationsAccount;
    vasync.waterfall([
      function getMapping(cb) {
        OperationsAccountUserMapping.find({"where": {"userModelId": token.userId}}, cb);
      },
      function getAccounts(result, cb) {
        if (result.length === 1) {
          Account.find({"where": {"id": result[0].operationsAccountId}}, cb);
        } else {
          cb(null, []);
        }
      }
    ], function end(err, result){
      if (err) {
        return next(err);
      }
      debug('> findAccount processed successfully');
      if (result.length === 1) {
        return next(err, [result]);
      }
      return next(err, result);
    });
  };

};
