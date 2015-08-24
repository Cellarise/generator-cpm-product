"use strict";
var config = require("./scripts/datasources-loader");
delete config.storage;
delete config.emailDs;
module.exports = config;
