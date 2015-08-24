"use strict";
var debug = require('debug')('loopback:loadValidations');
var R = require('ramda');
var validators = require('../../common/scripts/validators');

module.exports = {
  "getAllValidations": function getAllValidations(app, cb) {
    var models = app.models();
    models.forEach(function getValidationsForModel(model) {
      if (model.modelName === "UserModel") {
        this.getValidations(model);
      }
    }.bind(this));
    cb();
  },
  "getValidations": function getValidations(model) {
    var modelSettings = model.definition.settings;
    //check for validations object
    if (modelSettings.hasOwnProperty("validations")
      && R.is(Array, modelSettings.validations)
      && modelSettings.validations.length > 0) {
      R.pipe(
        R.toPairs,
        R.forEach(function processValPair(validationPair) {
          this.processValidation(model, validationPair);
        }.bind(this))
      )(model.definition.settings.validations[0]);
      debug('01 validations - ' + model.definition.name + ' - ADDED');
    } else {
      debug('01 validations - ' + model.definition.name + ' - NOT FOUND ');
    }
  },
  "processValidation": function processValidation(model, valPair) {
    var modelName = model.definition.name;
    var modelProp = valPair[0];
    R.pipe(
      R.toPairs,
      R.forEach(function processValObjPair(valObjPair) {
        var validationType = valObjPair[0];
        var validationConfig = validators.normaliseValidationConfig(valObjPair);
        var validateFunctionName = "validate" + validationType.charAt(0).toUpperCase() + validationType.slice(1);

        switch (validationType) {
          case "required":
            if (validationConfig._value) {
              model.validatesPresenceOf(modelProp);
            }
            break;
          case "length":
            model.validatesLengthOf(modelProp, validationConfig);
            break;
          case "numericality":
            model.validatesNumericalityOf(modelProp, validationConfig);
            break;
          case "inclusion":
            model.validatesInclusionOf(modelProp, validationConfig);
            break;
          case "exclusion":
            model.validatesExclusionOf(modelProp, validationConfig);
            break;
          case "format":
            model.validatesFormatOf(modelProp, validationConfig);
            break;
          case "uniqueness":
            model.validatesUniquenessOf(modelProp, validationConfig);
            break;
          case "passwordConfirm":
            model.validate(modelProp, validators[validateFunctionName], validationConfig);
            break;
          default:
            //model.validate(modelProp, validators[validateFunctionName], validationConfig);
        }
        debug('01 validations - ' + modelName + ' - ' + modelProp + ' - ' + validationType);
      })
    )(valPair[1]);
  }
};
