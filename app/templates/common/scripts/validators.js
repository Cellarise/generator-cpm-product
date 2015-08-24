"use strict";
/* eslint dot-notation:0 */
//Based on validations.js in loopback-datasource-juggler
var R = require('ramda');

module.exports = {
  "defaultMessages": {
    "presence": "can\'t be blank",
    "absence": "can\'t be set",
    "length": {
      "min": "too short",
      "max": "too long",
      "is": "length is wrong"
    },
    "range": {
      "min": "too low",
      "max": "too high",
      "is": "out of range"
    },
    "common": {
      "blank": "is blank",
      "null": "is null"
    },
    "numericality": {
      "int": "is not an integer",
      "number": "is not a number"
    },
    "inclusion": "is not included in the list",
    "exclusion": "is reserved",
    "uniqueness": "is not unique",
    "format": "is not valid",
    "required": "is required",
    "passwordConfirm": "is not comparable to partner field"
  },
  "normaliseValidationConfig": function normaliseValidationConfig(valObjPair) {
    return R.merge({
      "allowBlank": true,
      "allowNull": true
    }, R.is(Object, valObjPair[1]) ? valObjPair[1] : {
      "_value": valObjPair[1]
    });
  },
  "nullCheck": function nullCheck(attr, conf, err) {
    if (this[attr] === null) {
      if (!conf.allowNull) {
        err('null');
      }
      return true;
    }
    if (this.blank(this[attr])) {
      if (!conf.allowBlank) {
        err('blank');
      }
      return true;
    }
    return false;
  },
  /*!
   * Return true when v is undefined, blank array, null or empty string
   * otherwise returns false
   *
   * @param {Mix} v
   * Returns true if `v` is blank.
   */
  "blank": function blank(v) {
    return typeof v === 'undefined'
      || v instanceof Array && v.length === 0
      || v === null
      || typeof v === 'number' && isNaN(v)
      || typeof v == 'string' && v === '';
  },
  "validateType": function validateType(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    switch (conf.type) {
      case "string":
        return R.is(String, value) ? null : err();
      case "number":
        return R.is(Number, value) ? null : err();
      case "boolean":
        return R.is(Boolean, value) ? null : err();
      case "date":
        return R.is(Date, value) ? null : err();
      default:
        return null;
    }
  },
  "validateRequired": function validateRequired(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    if (conf && conf._value && (!value || value === "")) {
      err();
    }
  },
  "validateLength": function validateLength(attr, conf, err) {
    var value, len;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return;
    }
    value = this[attr];
    len = value.length + 1;
    if (R.has("min", conf) && len < conf.min) {
      err('min');
    }
    if (R.has("max", conf) && len > conf.max) {
      err('max');
    }
    if (R.has("is", conf) && len !== conf.is) {
      err('is');
    }
  },
  "validateRange": function validateRange(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    if (R.has("min", conf) && value < conf.min) {
      err('min');
    }
    if (R.has("max", conf) && value > conf.max) {
      err('max');
    }
    if (R.has("is", conf) && value !== conf.is) {
      err('is');
    }
  },
  "validateNumericality": function validateNumericality(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    if (!R.is(Number, value) || R.isNaN(value)) {
      return err('number');
    }
    if (value !== Math.round(value)) {
      return err('int');
    }
  },
  "validateInclusion": function validateInclusion(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    if (value !== "" && !R.contains(value, R.defaultTo([], conf["in"]))) {
      err();
    }
  },
  "validateExclusion": function validateExclusion(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    if (value !== "" && R.contains(value, R.defaultTo([], conf["in"]))) {
      err();
    }
  },
  "validateFormat": function validatePattern(attr, conf, err) {
    var value;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    if (R.is(String, value)) {
      if (!value.match(new RegExp(conf["with"]))) {
        err();
      }
    } else {
      err();
    }
  },
  "validateCompareTo": function validateCompareTo(attr, conf, err) {
    var value, compareValue;
    if (this.nullCheck.call(this, attr, conf, err)) {
      return null;
    }
    value = this[attr];
    compareValue = this[conf.attr];
    switch (conf.op) {
      case "neq":
        if (value === compareValue) {
          err();
        }
        break;
      default:
        if (value !== compareValue) {
          err();
        }
    }
  },
  "validatePasswordConfirm": function validatePasswordConfirm() {
    var value, compareValue, err = arguments[0];
    if (arguments.length > 1) {
      err = arguments[2];
    }
    value = this.changePassword;
    compareValue = this.changePasswordConfirm;
    if (value !== compareValue) {
      err();
    }
  }
};
