"use strict";
var config = require('./scripts/middleware-loader');
delete config.routes["./middleware/coverage"];
delete config.routes["./middleware/coverageReset"];
delete config.routes["loopback#status"];
module.exports = config;
