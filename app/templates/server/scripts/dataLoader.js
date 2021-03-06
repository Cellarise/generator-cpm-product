"use strict";
var R = require('ramda');
var vasync = require("vasync");
var debug = require('debug')('loopback:dataLoader');

var DataLoader = function DataLoader(app, modelName, dataJSON, relatedMap) {
  this._model = app.models[modelName];
  this._dataJSON = dataJSON;
  this._relatedMap = relatedMap || {};
  this._rows = [];
};

DataLoader.prototype.load = function load(cb) {
  var self = this;
  vasync.pipeline({
      'funcs': R.map(function mapRow(rowJSON) {
        return self.createLoadFunction(
            R.mapObjIndexed(function mapProp(val, key) {
              if (R.is(Array, val)) {
                if (!self._relatedMap.hasOwnProperty(key)) {
                  throw new Error("Expected relatedMap to contain key: " + key);
                }
                return self._relatedMap[key][val[0]];
              }
              return val;
            }, rowJSON)
        );
      }, self._dataJSON)
    },
    function done(err) {
      if (err) {
        debug('error: %s', err.message);
      }
      debug('04 data load - complete');
      cb(err, self._rows);
    });
};

DataLoader.prototype.createLoadFunction = function createLoadFunction(dataRow) {
  return function loadFunction(ignoredParam, callback) {
    this._model.updateOrCreate(dataRow, function cb(err, row) {
      if (err) {
        debug('Error - ' + JSON.stringify(err));
      }
      this._rows.push(row);
      console.log('Loaded - ' + JSON.stringify(row));
      callback(err);
    }.bind(this));
  }.bind(this);
};

module.exports = DataLoader;
