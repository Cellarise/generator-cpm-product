"use strict";
module.exports = {
  "setEnvironment": function setEnvironment() {
    //only set if process.env.CELLARISE_ENV hasn't already been set
    if (!process.env.hasOwnProperty("CELLARISE_ENV")) {
      process.env.CELLARISE_ENV = process.env.NODE_ENV;
    }
  },
  "isNonDevEnvironment": function isNonDevEnvironment() {
    return !process.env.hasOwnProperty("CELLARISE_ENV")
      || process.env.CELLARISE_ENV !== "development" && process.env.CELLARISE_ENV !== "QA";
  },
  "isDevEnvironment": function isDevEnvironment() {
    return !this.isNonDevEnvironment();
  },
  "hookCoverage": function hookCoverage() {
    if (process.env.hasOwnProperty("CELLARISE_COVERAGE")) {
      return process.env.CELLARISE_COVERAGE === "true";
    }
    return this.isDevEnvironment();
  }
};
