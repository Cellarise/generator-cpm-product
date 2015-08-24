"use strict";
var debug = require('debug')('loopback:operationsAccount');

module.exports = function operationsAccount(OperationsAccount) {

  OperationsAccount.dashboard = function dashboard(id, fileId, res, next) {
    switch (fileId) {
      case "7-Dashboard":
        break;
      case "7-Top10":
        break;
      default:
        return res.sendStatus(401);
    }
    debug('Downloading:', fileId + ".png");
    OperationsAccount.app.models.storage.download("nhvr-reporting-portal", fileId + ".png", res, next);
  };

  OperationsAccount.remoteMethod(
    'dashboard',
    {
      "description": 'Get contractor dashboard',
      "accepts": [
        {"arg": 'id', "type": 'string', "required": true},
        {"arg": 'fileId', "type": 'string', "required": true},
        {"arg": 'res', "type": 'object', "http": {"source": 'res'}}
      ],
      "http": {"verb": 'get'}
    }
  );

  OperationsAccount.upload = function upload(req, res, next) {
    OperationsAccount.app.models.storage.upload(req, res, next);
  };

  OperationsAccount.remoteMethod(
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
