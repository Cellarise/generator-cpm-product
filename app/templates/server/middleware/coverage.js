"use strict";
/**
 * Return [HTTP response](http://expressjs.com/4x/api.html#res.send) with code coverage information.
 * @header coverage()
 * @returns {middleware} coverage
 */
module.exports = function coverage() {
  return function middleware(req, res) {
    res.json(global.__coverage__ || {});
  };
};
