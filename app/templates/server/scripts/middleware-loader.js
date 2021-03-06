"use strict";

var config = {
  "initial:before": {
    "loopback#favicon": {"params": "$!../client/favicon.ico"}
  },
  "initial": {
    "compression": {}
  },
  "session": {},
  "auth": {
    "loopback#token": {}
  },
  "parse": {
    "body-parser#urlencoded": {"params": {"extended": false, "limit": "100kb"}},
    "body-parser#json": {"params": {"limit": "10mb"}}
  },
  "routes": {
    "./middleware/coverage": {"paths": "/coverage"},
    "./middleware/coverageReset": {"paths": "/coverageReset"},
    "loopback#status": {"paths": "/status"}
  },
  "files": {
    "loopback#static": {"params": "$!../client"}
  },
  "final": {
    "loopback#urlNotFound": {}
  },
  "final:after": {
    "errorhandler": {}
  }
};
module.exports = config;
