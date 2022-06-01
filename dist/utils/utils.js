"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFromState = void 0;

var _lodash = _interopRequireDefault(require("lodash.get"));

var getFromState = function getFromState(data, path, defaultReturn) {
  if (path === "" || !path) {
    return data || defaultReturn;
  }

  var res = (0, _lodash["default"])(data, path);
  return res === undefined ? defaultReturn : res;
};

exports.getFromState = getFromState;