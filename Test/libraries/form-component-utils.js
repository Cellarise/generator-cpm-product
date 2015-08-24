/* global window */
"use strict";
var assert = require('chai').assert;
var pollUntil = require('leadfoot/helpers/pollUntil');
var POLL_TIMEOUT = 5000;
module.exports = {
  "navigateToPage": function navigateToPage(context, page, done) {
    var MESSAGE = 'The browser should load the requested page';
    var EXPECTED = context.browser.url + '/' + page;
    context.browser.remote
      .get(EXPECTED)
      .then(pollUntil(function (url) { return window.location.href === url ? url : null; }, [EXPECTED], POLL_TIMEOUT))
      .then(function check(actual) {
        return assert.strictEqual(actual, EXPECTED, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "navigateToURL": function navigateToURL(context, page, done) {
    var MESSAGE = 'The browser should load the requested url';
    var EXPECTED = page;
    context.browser.remote
      .get(EXPECTED)
      .refresh()
      .then(pollUntil(function (url) { return window.location.href === url ? url : null; }, [EXPECTED], POLL_TIMEOUT))
      .then(function check(actual) {
        return assert.strictEqual(actual, EXPECTED, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "currentUrl": function currentUrl(context, page, done) {
    var MESSAGE = 'The browser should have loaded the expected page';
    var EXPECTED = context.browser.url + '/' + page;
    context.browser.remote
      .then(pollUntil(function ex(url) { return window.location.href === url ? url : null; }, [EXPECTED], POLL_TIMEOUT))
      .then(function check(actual) {
        return assert.strictEqual(actual, EXPECTED, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "currentUrlPartial": function currentUrlPartial(context, page, done) {
    var MESSAGE = 'The browser should have loaded the expected page';
    var EXPECTED = context.browser.url + '/' + page;
    context.browser.remote
      .then(pollUntil(
        function ex(url) { return window.location.href.indexOf(url) === 0 ? url : null; },
        [EXPECTED],
        POLL_TIMEOUT))
      .then(function check(actual) {
        return assert.strictEqual(actual, EXPECTED, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "refresh": function refresh(context, done) {
    context.browser.remote
      .refresh()
      .finally(done);
  },
  "clickOnElementByCss": function clickOnElementByCss(context, selector, done) {
    var MESSAGE = 'The element should exist and be clickable';
    context.browser.remote
      .setFindTimeout(POLL_TIMEOUT)
      .findByCssSelector(selector, function t1(element) {
        return assert.isObject(element, MESSAGE);
      })
      .click()
      .finally(done);
  },
  "findElementByCss": function findElementByCss(context, selector, done) {
    var MESSAGE = 'The element should exist';
    context.browser.remote
      .setFindTimeout(POLL_TIMEOUT)
      .findByCssSelector(selector)
      .then(function check(element) {
        return assert.isObject(element, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "clickOnLinkText": function clickOnLinkText(context, text, done) {
    var MESSAGE = 'The element should exist and be clickable';
    context.browser.remote
      .setFindTimeout(POLL_TIMEOUT)
      .findByLinkText(text, function t1(element) {
        return assert.isObject(element, MESSAGE);
      })
      .click()
      .finally(done);
  },
  "findByLinkText": function findByLinkText(context, text, done) {
    var MESSAGE = 'The element should exist';
    context.browser.remote
      .setFindTimeout(POLL_TIMEOUT)
      .findByLinkText(text)
      .then(function check(element) {
        return assert.isObject(element, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "findElementByCssAndText": function findElementByCssAndText(context, selector, text, done) {
    var MESSAGE = 'The element should exist';
    var EXPECTED = text;
    context.browser.remote
      .setFindTimeout(POLL_TIMEOUT)
      .findByCssSelector(selector, function t1(element) {
        return assert.isObject(element, MESSAGE);
      })
      .getVisibleText()
      .then(function check(actual) {
        return assert.strictEqual(actual, EXPECTED, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  },
  "typeIntoActiveElement": function typeIntoActiveElement(context, text, done) {
    var MESSAGE = 'The text should be typed into the input box';
    var EXPECTED = text;
    context.browser.remote
      .getActiveElement()
        .type(EXPECTED)
        .end()
      .getActiveElement()
      .getProperty('value')
      .then(function check(actual) {
        return assert.strictEqual(actual, EXPECTED, MESSAGE);
      }, function fail(error) {
        return assert(false, error.message);
      })
      .finally(done);
  }
};
