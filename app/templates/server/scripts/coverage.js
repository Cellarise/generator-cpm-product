"use strict";
var COVERAGE_VARIABLE = '__coverage__';
var path = require('path');
var R = require('ramda');
var istanbul = require('istanbul');
var Instrumenter = istanbul.Instrumenter;
var instrumenter = null;
var baselineCoverage = {};
var checkEnv = require('./checkEnvironment');

/** based on istanbul-middleware **/
//returns a matcher that returns all JS files under root
//except when the file is anywhere under `node_modules`
//does not use istanbul.matcherFor() so as to expose
//a synchronous interface
var getRootMatcher = function getRootMatcher() {
  return function matcherFn(file) {
    var _file = file.toLowerCase();
    return _file.indexOf('node_modules') === -1;
  };
};
//single place to get global coverage object
var getCoverageObject = function getCoverageObject() {
  global[COVERAGE_VARIABLE] = global[COVERAGE_VARIABLE] || {};
  return global[COVERAGE_VARIABLE];
};
module.exports = {
  /**
   * hooks `require` to add instrumentation to matching files loaded on the server
   * @param {String} root - a path relative to this file path under which all JS files
   * except those in `node_modules` are instrumented
   * @param {Object} opts - instrumenter options
   */
  "hook": function hook(root, opts) {
    var _transformer;
    var _root = root || "..";
    var _dirPath = path.join(__dirname, _root).toLowerCase();
    var _opts = opts || {};
    _opts.coverageVariable = COVERAGE_VARIABLE; //force this always

    if (!checkEnv.hookCoverage()) {
      return;
    }
    if (instrumenter) {
      return; //already hooked
    }
    instrumenter = new Instrumenter(_opts);
    _transformer = instrumenter.instrumentSync.bind(instrumenter);
    istanbul.hook.hookRequire(getRootMatcher(_dirPath), _transformer, {
      "verbose": _opts.verbose,
      "postLoadHook": function postLoadHook(file) {
        this.saveBaseline(file);
      }.bind(this)
    });
  },
  /**
   * save the baseline coverage stats for a file. This baseline is not 0
   * because of mainline code that is covered as part of loading the module
   * @param {String} file - the file for which baseline stats need to be tracked.
   */
  "saveBaseline": function saveBaseline(file) {
    var coverageObject = getCoverageObject();
    var fileCoverage;
    if (coverageObject && coverageObject[file]) {
      fileCoverage = coverageObject[file];
      if (!baselineCoverage[file]) {
        baselineCoverage[file] = {
          "s": R.clone(fileCoverage.s),
          "f": R.clone(fileCoverage.f),
          "b": R.clone(fileCoverage.b)
        };
      }
    }
  },
  /**
   * overwrites the coverage stats for the global coverage object to restore to baseline
   * @method restoreBaseline
   */
  "restoreBaseline": function restoreBaseline() {
    var cov = getCoverageObject();
    var fileCoverage;
    var fileBaseline;
    Object.keys(baselineCoverage).forEach(function eachFile(file) {
      fileBaseline = baselineCoverage[file];
      if (cov[file]) {
        fileCoverage = cov[file];
        fileCoverage.s = R.clone(fileBaseline.s);
        fileCoverage.f = R.clone(fileBaseline.f);
        fileCoverage.b = R.clone(fileBaseline.b);
      }
    });
    Object.keys(cov).forEach(function eachFile(file) {
      if (!baselineCoverage[file]) {
        delete cov[file];
      }
    });
  }
};
