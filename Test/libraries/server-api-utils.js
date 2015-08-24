"use strict";
var assert = require('chai').assert;
var path = require('path');
var fs = require('fs');
var API = '/api/';
module.exports = {
  "login": function login(context, email, password, expectedStatus, done) {
    var MESSAGE = 'The login should return ' + expectedStatus;
    var URL = context.browser.url + API + 'UserModels/login';
    context.browser.request({
        "method": 'POST',
        "url": URL,
        "json": true,
        "form": {
          "email": email,
          "password": password
        }
      },
      function cb(err, response, body) {
        if (err) {
          assert(false, err.message);
        } else {
          assert.strictEqual(response.statusCode, expectedStatus, MESSAGE);
        }
        context.world.body = body;
        done();
      }
    );
  },
  "loginAndCheckAccount": function loginAndCheckAccount(context, email, password, account, done) {
    var MESSAGE = 'The login should return account ' + account;
    this.login(context, email, password, 200, function cb(err) {
      if (!context.world.body) {
        assert(false, err.message);
      } else if (!context.world.body.hasOwnProperty(account + 's')) {
          assert(false, MESSAGE);
      } else {
        assert(context.world.body[account + 's'].length > 0, MESSAGE);
      }
      done();
    });
  },
  "checkEmailAndSaveLink": function checkEmailAndSaveLink(context, expectedEmail, done) {
    var MESSAGE = 'An email should be generated that matches the expected email';
    //wait before checking emails
    setTimeout(function afterTimeoutCheckEmailAndSaveLink() {
      //get sorted list of files
      var emailFiles = fs.readdirSync(path.join(context.cwd, '/Temp/')).sort();
      var actualEmail;
      if (emailFiles.length === 0) {
        assert(false, MESSAGE);
        return done();
      }
      //get last email file
      fs.readFile(path.join(context.cwd, '/Temp/', emailFiles[emailFiles.length - 1]), function cb(err, file) {
        if (err) {
          assert(false, err.message);
        } else {
          actualEmail = JSON.parse(file);
          assert.strictEqual(actualEmail.to, expectedEmail.to, MESSAGE);
          assert.strictEqual(actualEmail.from, expectedEmail.from, MESSAGE);
          assert.strictEqual(actualEmail.subject, expectedEmail.subject, MESSAGE);
          context.world.emailLink = actualEmail.html.substring(
            actualEmail.html.lastIndexOf("href=\"") + 6,
            actualEmail.html.lastIndexOf("\">"));
        }
        done();
      });
    }, 1000);
  },
  "checkTempFolderEmpty": function checkTempFolderEmpty(context, done) {
    var MESSAGE = 'An email should not be generated';
    //wait before checking emails
    setTimeout(function afterTimeout() {
      var emailFiles = fs.readdirSync(path.join(context.cwd, '/Temp/'));
      if (emailFiles.length > 0) {
        assert(false, MESSAGE);
        return done();
      }
      assert(true, MESSAGE);
      done();
    }, 1000);
  },
  "clearFolderRecursive": function clearFolderRecursive(dirToClear, done) {
    if (fs.existsSync(dirToClear)) {
      fs.readdirSync(dirToClear).forEach(function delFile(file) {
        var curPath = dirToClear + "/" + file;
        if (fs.lstatSync(curPath).isDirectory()) {
          clearFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath); //delete file
        }
      });
    }
    done();
  },
  "clearTempFolder": function clearTempFolder(context, done) {
    this.clearFolderRecursive(path.join(context.cwd, '/Temp/'), done);
  }
};
