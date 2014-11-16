"use strict";
/* Feature: Package: Add default generator for modules */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require('yeoman-generator').assert;
  var path = require("path");
  var helpers = require("yeoman-generator").test;
  var SANDBOX = path.resolve(__dirname, '../../Temp');
  var runCwd;

  return English.library()
    /*Scenario: Generate a default module */
    .define("Given a new folder",
    function test(done) {
      runCwd = process.cwd(); //remember cwd
      helpers.testDirectory(SANDBOX, done);
      //set clean up after scenario complete
      this.world.after = function afterScenario(done) {
        var exec = require("child_process").exec;
        exec("rm -r " + SANDBOX, {},
          function execCommandCallback() {
            //assert(!error); //this returns an error as it can't delete the Temp directory.
            //However, all files and folders contained within it are deleted.
            process.chdir(runCwd); //reset cwd
            done();
          });
      };
    })
    .define("When calling the generator",
    function test(done) {
      var deps = [
        [helpers.createDummyGenerator(), 'cpm-module:app']
      ];
      helpers.run(path.join(__dirname, '../../app'))
        .inDir(SANDBOX)
        .withGenerators(deps)
        .withOptions({
          "skip-welcome-message": true,
          "skip-module": true,
          "skip-install": true
        })
        .on('end', done);
    })
    .define("When calling the generator skipping the greeting",
    function test(done) {
      helpers.run(path.join(__dirname, '../../app'))
        .inDir(SANDBOX)
        .withOptions({
          "skip-welcome-message": true
        })
        .withPrompts({
          "projectCode": 'MODTEST',
          "projectName": 'test-app',
          "projectDesc": 'My new test app'
        })
        .on('end', done);
    })
    .define("Then the expected folder structure and files are generated",
    function test(done) {
      var self = this;
      var dd;
      var ndd = require("node-dir-diff");
      var standardDir = path.resolve(__dirname, '../../app/templates/standard');
      var packageDir = path.resolve(__dirname, '../../Test_Resources');
      dd = new ndd.Dir_Diff(
        [
          SANDBOX,
          standardDir,
          packageDir
        ],
        "size");
      dd.compare(function ddCompare(err, result){
        if (err || result.missing.length > 0){
          self.world.logger.error(result);
          assert(!err, "ddCompare error: " + err);
          assert.equal(result.missing.length, 0);
        }
        done();
      });
    });
})();
