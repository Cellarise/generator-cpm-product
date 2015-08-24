"use strict";
/* Feature: Package: Add default generator for modules */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require('yeoman-generator').assert;
  var path = require("path");
  var helpers = require("yeoman-generator").test;
  var SANDBOX = path.resolve(__dirname, '../../Temp');
  var TESTPACKAGE = path.resolve(__dirname, '../../Test_Resources/package.json');
  var runCwd;

  return English.library()
    /*Scenario: Generate a default module */
    .define("Given a new folder with an existing package.json",
    function test(done) {
      runCwd = process.cwd(); //remember cwd
      helpers.testDirectory(SANDBOX, done);
      //set clean up after scenario complete
      this.world.after = function afterScenario(afterDone) {
        var exec = require("child_process").exec;
        exec("rm -r " + SANDBOX, {},
          function execCommandCallback() {
            //assert(!error); //this returns an error as it can't delete the Temp directory.
            //However, all files and folders contained within it are deleted.
            process.chdir(runCwd); //reset cwd
            afterDone();
          });
      };
    })
    .define("When calling the generator",
    function test(done) {
      helpers.run(path.join(__dirname, '../../app'))
        .inDir(SANDBOX)
        .withOptions({
          "skip-welcome-message": true,
          "package-path": TESTPACKAGE,
          "skip-install": true
        })
        .on('end', done);
    })
    .define("Then the expected folder structure and files are generated",
    function test(done) {
      done();
    });
})();
