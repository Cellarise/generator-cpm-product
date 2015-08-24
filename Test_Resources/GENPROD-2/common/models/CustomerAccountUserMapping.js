"use strict";
var debug = require('debug')('loopback:CustomerAccountUserMapping');
var vasync = require('vasync');

module.exports = function customerAccountUserMapping(CustomerAccountUserMapping) {

  CustomerAccountUserMapping.findAccount = function findAccount(token, next) {
    var Account = CustomerAccountUserMapping.app.models.CustomerAccount;
    vasync.waterfall([
      function getMapping(cb) {
        CustomerAccountUserMapping.find({"where": {"userModelId": token.userId}}, cb);
      },
      function getAccounts(result, cb) {
        //@todo get all accounts
        if (result.length === 1) {
          Account.find({"where": {"id": result[0].customerAccountId}}, cb);
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
