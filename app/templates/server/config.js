"use strict";
var p = require('../package.json');
//var version = p.version.split('.').shift();
var externalURL = {
  "protocol": process.env.AZURE_HOST_NAME ? "https" : "http",
  "host": process.env.AZURE_HOST_NAME ? process.env.AZURE_HOST_NAME : 'localhost',
  "port": process.env.AZURE_HOST_NAME ? null : process.env.PORT || 3000
};
module.exports = {
  "aclErrorStatus": 401,
  //"cookieSecret": null
  "restApiRoot": '/api', //+ (version > 0 ? '/v' + version : ''),
  "host": process.env.HOST || 'localhost',
  "externalURL": {
    "protocol": externalURL.protocol,
    "host": externalURL.host,
    "port": externalURL.port,
    "url": externalURL.protocol + '://' + externalURL.host + (externalURL.port ? ':' + externalURL.port : "")
  },
  "applicationName": p.name,
  "legacyExplorer": false,
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
