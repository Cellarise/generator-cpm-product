"use strict";
var debug = require('debug')('loopback:upsertDataLoaders');
var DataLoader = require("../../server/scripts/dataLoader");
module.exports = function upserters(app, cb) {
  var createUpsertMethod = function createUpsertMethod(model, modelName) {
    return function upsert(upsertData, next) {
      var loader = new DataLoader(model.app, modelName, upsertData.body);
      loader.load(function callback(err) {
        if (err) {
          return next(err);
        }
        debug('> data processed successfully');
        return next(err, {
          "message": "Data upsert successful."
        });
      });
    };
  };
  var remoteMethodUpsertConfig = {
    "description": 'upsertData',
    "accepts": [
      {"arg": 'upsertData', "type": 'object', "required": true, "http": {"source": 'req'}}
    ],
    "returns": {
      "arg": 'message', "type": 'object', "root": true,
      "description": 'The response body contains success message.\n'
    },
    "http": {"verb": 'post'}
  };

  app.models.PartnerConsent.upsertData = createUpsertMethod(app.models.PartnerConsent, "PartnerConsent");
  app.models.PartnerConsent.remoteMethod('upsertData', remoteMethodUpsertConfig);
  app.models.PartnerAccount.upsertData = createUpsertMethod(app.models.PartnerAccount, "PartnerAccount");
  app.models.PartnerAccount.remoteMethod('upsertData', remoteMethodUpsertConfig);
  app.models.CustomerCase.upsertData = createUpsertMethod(app.models.CustomerCase, "CustomerCase");
  app.models.CustomerCase.remoteMethod('upsertData', remoteMethodUpsertConfig);
  app.models.CustomerAccount.upsertData = createUpsertMethod(app.models.CustomerAccount, "CustomerAccount");
  app.models.CustomerAccount.remoteMethod('upsertData', remoteMethodUpsertConfig);
  debug('05 upsertDataLoaders - added');
  cb();
};
