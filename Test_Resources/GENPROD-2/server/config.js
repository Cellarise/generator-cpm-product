"use strict";
var p = require('../package.json');
//var version = p.version.split('.').shift();

module.exports = {
  "aclErrorStatus": 401,
  //"cookieSecret": null
  "restApiRoot": '/api', //+ (version > 0 ? '/v' + version : ''),
  "host": process.env.HOST || 'localhost',
  "externalHost": process.env.AZURE_HOST_NAME || 'localhost',
  "applicationName": p.name,
  "remoting": {
    "context": {
      "enableHttpContext": false
    },
    "rest": {
      "normalizeHttpPath": false,
      "xml": false
    },
    "json": {
      "strict": false,
      "limit": "100kb"
    },
    "urlencoded": {
      "extended": false,
      "limit": "100kb"
    },
    "cors": {
      "origin": true,
      "credentials": true
    },
    "errorHandler": {
      "disableStackTrace": true
    }
  }
};
