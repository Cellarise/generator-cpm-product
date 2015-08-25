"use strict";
var debug = require('debug')('loopback:resolvers');
var R = require('ramda');
module.exports = function resolvers(app, cb) {
  var Role = app.models.Role;

  var isInAccount = function isInAccount(context, AccountMappingModel, accountIdField, userId, accountId, callback) {
    var accountIdWhereClause = {};
    accountIdWhereClause[accountIdField] = accountId;
    if (!userId || !accountId) {
      // do not allow anonymous users
      // do not allow access without account id specified
      debug('isInAccount() - userId' + userId);
      debug('isInAccount() - accountId' + accountId);
      return callback(null, false);
    }
    // check if userId is in CustomerAccountUserMapping table for the given account id
    AccountMappingModel.count({"and": [accountIdWhereClause, {"userModelId": userId}]},
      function accountUserMapping(err, count) {
        if (err) {
          debug('isInAccount() - accountUserMapping error');
          return callback(err);
        }
        if (count > 0) {
          return callback(null, true);
        }
        debug('isInAccount() - accountUserMapping=0');
        //give access if admin
        Role.isInRole("admin", context, callback);
      });
  };

  var customerAccountUserResolver = function customerAccountUserResolver(role, context, callback) {
    var CustomerAccountUserMapping = app.models.CustomerAccountUserMapping;
    var userId = context.accessToken.userId;
    var modelId = context.modelId;
    if (context.modelName === 'CustomerAccount') {
      debug('customerAccountUserResolver() - context.modelName === "CustomerAccount"');
      return isInAccount(context, CustomerAccountUserMapping, 'customerAccountId', userId, modelId, callback);
    }
    if (context.modelName === 'CustomerCase') {
      debug('customerAccountUserResolver() - context.modelName === "CustomerCase"');
      //get case record and consents to obtain customerAccountId and partnerAccountId's
      return app.models.CustomerCase.find({
        "where": {"id": modelId},
        "include": "partnerConsent"
      }, function customerCases(err, rows) {
        if (err) {
          debug('CustomerCase.find() - customerCases error');
          return callback(err);
        }
        if (rows && rows.length === 0) {
          debug('CustomerCase.find() - customerCases rows.length === 0');
          return callback(null, false);
        }
        return isInAccount(context, CustomerAccountUserMapping, 'customerAccountId', userId, rows[0].customerAccountId,
          function cb1(err1, isInCustomerAccountUser) {
            var PartnerAccountUserMapping = app.models.PartnerAccountUserMapping;
            if (err1) {
              debug('CustomerCase.find() - PartnerAccountUserMapping error');
              return callback(err1);
            }
            if (isInCustomerAccountUser) {
              return callback(null, true);
            }
            //check if in partnerAccountUser for any of the consents
            PartnerAccountUserMapping.count({
              "and": [{
                "partnerAccountId": {
                  "inq": R.map(function mapRow(consent) {
                    return consent.partnerAccountId;
                  }, rows[0].toJSON().partnerConsent)
                }
              }, {"userModelId": userId}]
            }, function accountUserMappingCallback(err2, count) {
              if (err2) {
                debug('CustomerCase.find() - accountUserMappingCallback error');
                return callback(err2);
              }
              if (count === 0) {
                debug('CustomerCase.find() - accountUserMappingCallback count === 0');
                return callback(null, false);
              }
              callback(null, true);
            });
          });
      });
    }
    return callback(null, false); // the target model is not account
  };
  var partnerAccountUserResolver = function partnerAccountUserResolver(role, context, callback) {
    var PartnerAccountUserMapping = app.models.PartnerAccountUserMapping;
    var userId = context.accessToken.userId;
    var modelId = context.modelId;
    if (context.modelName === 'PartnerAccount') {
      debug('partnerAccountUserResolver() - context.modelName === "PartnerAccount"');
      return isInAccount(context, PartnerAccountUserMapping, 'partnerAccountId', userId, modelId, callback);
    }
    if (context.modelName === 'PartnerConsent') {
      //get consent record to obtain partnerAccountId
      return app.models.PartnerConsent.find({
        "where": {"id": modelId}
      }, function accountUserMapping(err, rows) {
        if (err) {
          debug('partnerAccountUserResolver() - accountUserMapping error');
          return callback(err);
        }
        if (rows && rows.length === 0) {
          debug('partnerAccountUserResolver() - accountUserMapping rows.length === 0');
          return callback(null, false);
        }
        return isInAccount(
          context, PartnerAccountUserMapping, 'partnerAccountId', userId, rows[0].partnerAccountId, callback
        );
      });
    }
    return callback(null, false); // the target model is not account
  };
  var operationsAccountUserResolver = function operationsAccountUserResolver(role, context, callback) {
    var OperationsAccountUserMapping = app.models.OperationsAccountUserMapping;
    var userId = context.accessToken.userId;
    var modelId = context.modelId;
    if (context.modelName === 'OperationsAccount') {
      debug('operationsAccountUserResolver() - context.modelName === "OperationsAccount"');
      return isInAccount(context, OperationsAccountUserMapping, 'operationsAccountId', userId, modelId, callback);
    }
    return callback(null, false); // the target model is not account
  };
  var contractorAccountUserResolver = function contractorAccountUserResolver(role, context, callback) {
    var ContractorAccountUserMapping = app.models.ContractorAccountUserMapping;
    var userId = context.accessToken.userId;
    var modelId = context.modelId;
    if (context.modelName === 'ContractorAccount') {
      debug('contractorAccountUserResolver() - context.modelName === "ContractorAccount"');
      return isInAccount(context, ContractorAccountUserMapping, 'contractorAccountId', userId, modelId, callback);
    }
    return callback(null, false); // the target model is not account
  };

  Role.registerResolver('customerAccountUser', customerAccountUserResolver);
  Role.registerResolver('partnerAccountUser', partnerAccountUserResolver);
  Role.registerResolver('operationsAccountUser', operationsAccountUserResolver);
  Role.registerResolver('contractorAccountUser', contractorAccountUserResolver);

  debug('03 role resolvers - added');
  cb();
};
