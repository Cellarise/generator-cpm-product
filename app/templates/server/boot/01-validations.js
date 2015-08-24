"use strict";
//var debug = require('debug')('loopback:loadValidations');
var validations = require('../scripts/validation-loader');
module.exports = function loadValidations(app, cb) {
  validations.getAllValidations(app, cb);
};
