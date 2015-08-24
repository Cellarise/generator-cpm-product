"use strict";
var debug = require('debug')('loopback:partnerAccount');
var DataLoader = require("../../server/dataLoader");
module.exports = function partnerAccount(PartnerAccount) {
  PartnerAccount.getPartnerRecords = function getPartnerRecords(reqData, next) {
    var filter = reqData.body.filter;
    var limit = reqData.body.limit || 10;
    var skip = reqData.body.skip || 0;
    PartnerAccount.find({
      "where": {
        "or": [
          {"id": {"like": "%" + filter + "%"}},
          {"name": {"like": "%" + filter + "%"}}
        ]
      }, "limit": limit, "skip": skip
    }, function cb(err, result) {
      if (err) {
        return next(err);
      }
      debug('> find partner accounts processed successfully');
      return next(err, result);
    });
  };

  PartnerAccount.remoteMethod(
    'getPartnerRecords',
    {
      "description": 'Get partner records',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains partner records.\n'
      },
      "http": {"verb": 'post'}
    }
  );


  PartnerAccount.getPartnerById = function getPartnerById(reqData, next) {
    PartnerAccount.findById(reqData.body.id, function cb(err, result) {
      if (err) {
        return next(err);
      }
      debug('> find partner account by id processed successfully');
      return next(err, result);
    });
  };
  PartnerAccount.remoteMethod(
    'getPartnerById',
    {
      "description": 'Get partner record by id',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains partner record.\n'
      },
      "http": {"verb": 'post'}
    }
  );


  PartnerAccount.getConsents = function getConsents(reqData, next) {
    var filter;
    var limit = reqData.body.limit || 10;
    var skip = reqData.body.skip || 0;
    var order = reqData.body.order || "";
    switch (reqData.body.filter) {
      case "completed":
        filter = {
          "and": [
            {"partnerAccountId": reqData.body.id},
            {"workflowState": {"inq": ['4 Granted', '4 Rejected', '5 Closed']}}
          ]
        };
        break;
      case "inProgress":
      default:
        filter = {
          "and": [
            {"partnerAccountId": reqData.body.id},
            {"workflowState": {"nin": ['4 Granted', '4 Rejected', '5 Closed']}}
          ]
        };
    }
    PartnerAccount.app.models.PartnerConsent.find({
        "where": filter,
        "limit": limit,
        "skip": skip,
        "order": order,
        "include": "customerCase",
        "tSQLJoin": {
          "model": "CustomerCase",
          "fromColumn": "customerCaseId",
          "toColumn": "id"
        }
      },
      function cb(err, result) {
        if (err) {
          return next(err);
        }
        debug('> find partner consents processed successfully');
        return next(err, result);
      });
  };

  PartnerAccount.remoteMethod('getConsents', {
      "description": 'Get partner consents',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains partner consents.\n'
      },
      "http": {"verb": 'post'}
    });

  PartnerAccount.getConsentsCount = function getConsentsCount(reqData, next) {
    var filter;
    switch (reqData.body.filter) {
      case "completed":
        filter = {
          "and": [
            {"partnerAccountId": reqData.body.id},
            {"workflowState": {"inq": ['4 Granted', '4 Rejected', '5 Closed']}}
          ]
        };
        break;
      case "inProgress":
      default:
        filter = {
          "and": [
            {"partnerAccountId": reqData.body.id},
            {"workflowState": {"nin": ['4 Granted', '4 Rejected', '5 Closed']}}
          ]
        };
    }
    PartnerAccount.app.models.PartnerConsent.count(filter,
      function cb(err, result) {
        if (err) {
          return next(err);
        }
        debug('> find partner consents processed successfully');
        return next(err, result);
      });
  };

  PartnerAccount.remoteMethod('getConsentsCount', {
    "description": 'Get partner consents count',
    "accepts": [
      {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
    ],
    "returns": {
      "arg": 'result', "type": 'number', "root": true,
      "description": 'The response body contains count of partner consents.\n'
    },
    "http": {"verb": 'post'}
  });

  PartnerAccount.upsertData = function upsert(upsertData, next) {
    var loader = new DataLoader(PartnerAccount.app, "PartnerAccount", upsertData.body);
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

  PartnerAccount.remoteMethod(
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
