"use strict";
var R = require("ramda");
var SQLCONNSTR, connectionObject, config = {};

switch (process.env.CELLARISE_ENV) {
  case "production":
    SQLCONNSTR = process.env.SQLAZURECONNSTR_ProductionConnection;
    break;
  case "staging":
    SQLCONNSTR = process.env.SQLAZURECONNSTR_StagingConnection;
    break;
  case "QA":
    SQLCONNSTR = process.env.SQLAZURECONNSTR_QAConnection;
    break;
  case "development":
    SQLCONNSTR = process.env.SQLAZURECONNSTR_DevConnection;
    break;
  default:
    SQLCONNSTR = null;
    break;
}

if (SQLCONNSTR) {
  connectionObject = R.pipe(
    R.split(";"),
    R.map(R.split("=")),
    R.fromPairs()
  )(SQLCONNSTR);
  config = {
    "db": {
      "name": "db",
      "connector": "mssql",
      "host": connectionObject["Data Source"].split(":")[1].split(",")[0],
      "port": 1433,
      "database": connectionObject["Initial Catalog"],
      "user": connectionObject["User Id"],
      "password": connectionObject.Password,
      "supportsOffsetFetch": true, //mssql-cellarise requires this setting for limit and offset functions (MSQL2012+)
      "options": {
        "encrypt": true,
        "connectTimeout": 30000
      }
    },
    "storage": {
      "name": "storage",
      "connector": "loopback-component-storage",
      "provider": "azure",
      "storageAccount": process.env.STORAGE_NAME,
      "storageAccessKey": process.env.STORAGE_KEY
    },
    "emailDs": {
      "name": "emailDs",
      "connector": "lb-connector-mandrill",
      "apikey": process.env.MANDRILL_KEY
    }
  };
}
module.exports = config;
