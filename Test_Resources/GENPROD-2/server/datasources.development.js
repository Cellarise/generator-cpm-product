"use strict";
var config = require("./datasources-loader");
delete config.storage;
module.exports = config;
