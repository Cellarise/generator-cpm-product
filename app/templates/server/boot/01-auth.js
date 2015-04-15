"use strict";
module.exports = function enableAuthentication(app, cb) {
  app.enableAuth();
  cb();
};
