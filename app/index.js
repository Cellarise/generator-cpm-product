"use strict";

var generators = require('yeoman-generator');
var actions = require('../lib/actions');

/**
 * {description}
 * @module cpm-product
 * @example
 {>example-index/}
 */

module.exports = generators.Base.extend({
  "initializing": actions.greet,
  "writing": actions.scaffold,
  "install": actions.install
});
