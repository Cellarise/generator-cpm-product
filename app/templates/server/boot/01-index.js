"use strict";
var debug = require('debug')('loopback:indexHTMLSetup');
module.exports = function indexHTMLSetup(app, cb) {
  // update index.html
  var fs = require('fs');
  var path = require('path');
  var indexFilePath = path.join(__dirname, "../../client/index.html");
  fs.readFile(indexFilePath, 'utf8', function readFileCallback(err, data) {
    var result;
    var googleAnalyticID = process.env.google_analytics_trackingID || "-";
    var googleMatch = "'----_GOOGLEANALYTICSIDINSERTEDBYSERVER_----'";
    if (err) {
      return debug(err);
    }
    result = data.replace(googleMatch,
      "'" + googleAnalyticID + "'");
    fs.writeFile(indexFilePath, result, function writeFileCallback(err1) {
      if (err1) {
        return debug(err1);
      }
      debug('01 index.html - updated');
    });
  });
  cb();
};
