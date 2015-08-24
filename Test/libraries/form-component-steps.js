"use strict";
/* Feature: Package: sample */
module.exports = (function testSuite() {
  var Yadda = require("yadda");
  var English = Yadda.localisation.English;
  var dictionary = new Yadda.Dictionary();
  var lib = require("./form-component-utils");
  var vasync = require("vasync");

  return English.library(dictionary)
    /*Scenario:  */
    .define("Open the browser at the home page", function test(done) {
      lib.navigateToPage(this, "", done);
    })
    .define("Open the browser at '$page'", function test(page, done) {
      lib.navigateToPage(this, page, done);
    })
    .define("Login using email '$User_email' and password '$User_password'", function test(email, password, done) {
      vasync.pipeline({
          'funcs': [
            function func(_null, cb) {
              lib.clickOnElementByCss(this, 'input[label="Email address"]', cb);
            }.bind(this),
            function func(_null, cb) {
              lib.typeIntoActiveElement(this, email, cb);
            }.bind(this),
            function func(_null, cb) {
              lib.clickOnElementByCss(this, 'input[label="Password"]', cb);
            }.bind(this),
            function func(_null, cb) {
              lib.typeIntoActiveElement(this, password, cb);
            }.bind(this),
            function func(_null, cb) {
              lib.clickOnElementByCss(this, 'button[name="Sign in"]', cb);
            }.bind(this)
          ]
        }, done);
    })
    .define("Click on the input box labelled '$label'", function test(label, done) {
      lib.clickOnElementByCss(this, 'input[label="' + label + '"]', done);
    })
    .define("Type into the input box '$text'", function test(text, done) {
      lib.typeIntoActiveElement(this, text, done);
    })
    .define("Click on the '$button' button", function test(button, done) {
      lib.clickOnElementByCss(this, 'button[name="' + button + '"]', done);
    })
    .define("Click on the '$checkbox' checkbox", function test(checkbox, done) {
      lib.clickOnElementByCss(this, 'input[name="' + checkbox + '"]', done);
    })
    .then("the '$page' page should (be|remain) displayed", function test(page, _1, done) {
      if (page === 'Login') {
        return lib.findElementByCss(this, 'h2[title="Login"]', done);
      }
      lib.currentUrlPartial(this, page, done);
    })
    .then("the '$alert' alert should (be|remain) displayed", function test(alert, _1, done) {
      lib.findElementByCssAndText(this, "div[role='alert']", alert, done);
    })
    .define("Refresh the browser", function test(done) {
      lib.refresh(this, done);
    })
    .define("Click on the link labelled '$label'", function test(label, done) {
      lib.clickOnLinkText(this, label, done);
    })
    .define("Click on the '$menuItem' menu item followed by the '$subMenuItem' menu item",
    function test(menuItem, subMenuItem, done) {
      lib.clickOnLinkText(this, menuItem, function cb1() {
        lib.clickOnLinkText(this, subMenuItem, done);
      }.bind(this));
    })
    .define("Click on the link in the email",
    function test(done) {
      lib.navigateToURL(this, this.world.emailLink, done);
    });
})();
