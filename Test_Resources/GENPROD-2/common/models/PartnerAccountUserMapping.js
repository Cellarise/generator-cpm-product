"use strict";
var debug = require('debug')('loopback:partnerAccountUserMapping');
var vasync = require('vasync');

module.exports = function partnerAccountUserMapping(PartnerAccountUserMapping) {

  PartnerAccountUserMapping.findAccount = function findAccount(token, next) {
    var Account = PartnerAccountUserMapping.app.models.PartnerAccount;
    vasync.waterfall([
      function getMapping(cb) {
        PartnerAccountUserMapping.find({"where": {"userModelId": token.userId}}, cb);
      },
      function getAccounts(result, cb) {
        if (result.length === 1) {
          Account.find({"where": {"id": result[0].partnerAccountId}}, cb);
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
