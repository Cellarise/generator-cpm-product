"use strict";
var debug = require('debug')('loopback:contractorAccount');

module.exports = function contractorAccount(ContractorAccount) {

  ContractorAccount.dashboard = function dashboard(id, res, next) {
    var fileId;
    switch (id) {
      case "RMQLD1":
        fileId = "1";
        break;
      case "RMNSW1":
        fileId = "2";
        break;
      case "RMACT1":
        fileId = "3";
        break;
      case "RMVIC9":
        fileId = "4";
        break;
      case "RMSA1":
        fileId = "5";
        break;
      case "RMTAS1":
        fileId = "6";
        break;
      default:
        return res.sendStatus(401);
    }
    debug('Downloading:', fileId + ".png");
    ContractorAccount.app.models.storage.download("nhvr-reporting-portal", fileId + ".png", res, next);
  };

  ContractorAccount.remoteMethod(
    'dashboard',
    {
      "description": 'Get contractor dashboard',
      "accepts": [
        {"arg": 'id', "type": 'string', "required": true},
        {"arg": 'res', "type": 'object', "http": {"source": 'res'}}
      ],
      "http": {"verb": 'get'}
    }
  );

  ContractorAccount.upload = function upload(req, res, next) {
    ContractorAccount.app.models.storage.upload(req, res, next);
  };

  ContractorAccount.remoteMethod(
    'upload',
    {
      "description": 'Upload file to storage',
      "accepts": [
        {"arg": 'req', "type": 'object', "http": {"source": 'req'}},
        {"arg": 'res', "type": 'object', "http": {"source": 'res'}}
      ],
      "http": {"verb": 'post'}
    }
  );
};
