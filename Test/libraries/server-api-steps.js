"use strict";
/* Feature: Package: sample */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var lib = require("./server-api-utils");

  return English.library()
    /*Scenario:  */
    .given("the email '$email' and password '$password' is a valid credential",
    function test(email, password, done) {
      lib.login(this, email, password, 200, done);
    })
    .given("the email '$email' and password '$password' is an invalid credential",
    function test(email, password, done) {
      lib.login(this, email, password, 401, done);
    })
    .given("the email '$email' and password '$password' is a valid credential with account '$account'",
    function test(email, password, account, done) {
      lib.loginAndCheckAccount(this, email, password, account, done);
    })
    .then("(A|a)n email is generated from '$from' to '$to' with subject '$subject'",
    function test(_1, from, to, subject, done) {
      lib.checkEmailAndSaveLink(this, {
        "from": from,
        "to": to,
        "subject": subject
      }, done);
    })
    .define("Clear all emails",
    function test(done) {
      lib.clearTempFolder(this, done);
    })
    .then("(A|a)n email is not generated",
    function test(_1, done) {
      lib.checkTempFolderEmpty(this, done);
    });
})();
