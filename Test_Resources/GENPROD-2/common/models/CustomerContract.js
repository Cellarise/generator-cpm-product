"use strict";
var debug = require('debug')('loopback:customerCase');
var DataLoader = require("../../server/dataLoader");
module.exports = function customerCase(CustomerCase) {

  CustomerCase.getCaseById = function getCaseById(reqData, next) {
    CustomerCase.findOne({"where": {"id": reqData.body.id},
        "include": ["customerAccount", {"partnerConsent": "partnerAccount"}]},
      function cb(err, result) {
        if (err) {
          return next(err);
        }
        debug('> find customer cases processed successfully');
        return next(err, result);
      });
  };

  CustomerCase.remoteMethod(
    'getCaseById',
    {
      "description": 'Get customer case detail',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains customer case detail.\n'
      },
      "http": {"verb": 'post'}
    }
  );

  CustomerCase.upsertData = function upsert(upsertData, next) {
    var loader = new DataLoader(CustomerCase.app, "CustomerCase", upsertData.body);
    loader.load(function cb(err) {
      if (err) {
        return next(err);
      }
      debug('> data processed successfully');
      return next(err, {
        "message": "Data upsert successful."
      });
    });
  };
  CustomerCase.remoteMethod(
    'upsertData',
    {
      "description": 'upsertData',
      "accepts": [
        {"arg": 'upsertData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'message', "type": 'object', "root": true,
        "description": 'The response body contains success message.\n'
      },
      "http": {"verb": 'post'}
    }
  );
};
