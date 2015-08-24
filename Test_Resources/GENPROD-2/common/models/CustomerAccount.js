"use strict";
var debug = require('debug')('loopback:customerAccount');
var DataLoader = require("../../server/dataLoader");
module.exports = function customerAccount(CustomerAccount) {
  CustomerAccount.getCustomerRecords = function getCustomerRecords(reqData, next) {
    var filter = reqData.body.filter;
    var limit = reqData.body.limit || 10;
    var skip = reqData.body.skip || 0;
    CustomerAccount.find({
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
      debug('> find customer accounts processed successfully');
      return next(err, result);
    });
  };

  CustomerAccount.remoteMethod(
    'getCustomerRecords',
    {
      "description": 'Get customer records',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains customer records.\n'
      },
      "http": {"verb": 'post'}
    }
  );


  CustomerAccount.getCustomerById = function getCustomerById(reqData, next) {
    CustomerAccount.findById(reqData.body.id, function cb(err, result) {
      if (err) {
        return next(err);
      }
      debug('> find customer accounts processed successfully');
      return next(err, result);
    });
  };
  CustomerAccount.remoteMethod(
    'getCustomerById',
    {
      "description": 'Get customer record by id',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains customer record.\n'
      },
      "http": {"verb": 'post'}
    }
  );


  CustomerAccount.getCases = function getCases(reqData, next) {
    var filter;
    var limit = reqData.body.limit || 10;
    var skip = reqData.body.skip || 0;
    var order = reqData.body.order || "";
    switch (reqData.body.filter) {
      case "completed":
        filter = {
          "and": [
            {"customerAccountId": reqData.body.id},
            {"workflowState": {"like": "5%"}}]
        };
        break;
      case "inProgress":
      default:
        filter = {
          "and": [
            {"customerAccountId": reqData.body.id},
            {"workflowState": {"nlike": "5%"}}]
        };
    }
    CustomerAccount.app.models.CustomerCase.find({"where": filter,
        "limit": limit, "skip": skip, "order": order},
      function cb(err, result) {
        if (err) {
          return next(err);
        }
        debug('> find customer cases processed successfully');
        return next(err, result);
      });
  };

  CustomerAccount.remoteMethod('getCases', {
      "description": 'Get customer cases',
      "accepts": [
        {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
      ],
      "returns": {
        "arg": 'results', "type": 'object', "root": true,
        "description": 'The response body contains customer cases.\n'
      },
      "http": {"verb": 'post'}
    });

  CustomerAccount.getCasesCount = function getCasesCount(reqData, next) {
    var filter;
    switch (reqData.body.filter) {
      case "completed":
        filter = {
          "and": [
            {"customerAccountId": reqData.body.id},
            {"workflowState": {"like": "5%"}}]
        };
        break;
      case "inProgress":
      default:
        filter = {
          "and": [
            {"customerAccountId": reqData.body.id},
            {"workflowState": {"nlike": "5%"}}]
        };
    }
    CustomerAccount.app.models.CustomerCase.count(filter,
      function cb(err, result) {
        if (err) {
          return next(err);
        }
        debug('> count customer cases processed successfully');
        return next(err, result);
      });
  };

  CustomerAccount.remoteMethod('getCasesCount', {
    "description": 'Get customer cases count',
    "accepts": [
      {"arg": 'reqData', "type": 'object', "required": true, "http": {"source": 'req'}}
    ],
    "returns": {
      "arg": 'result', "type": 'number', "root": true,
      "description": 'The response body contains count of customer cases.\n'
    },
    "http": {"verb": 'post'}
  });

  CustomerAccount.upsertData = function upsert(upsertData, next) {
    var loader = new DataLoader(CustomerAccount.app, "CustomerAccount", upsertData.body);
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

  CustomerAccount.remoteMethod(
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
