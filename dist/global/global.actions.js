"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPassDataClear = exports.setPassData = exports.setAddToRedux = void 0;

var _global = _interopRequireDefault(require("./global.types"));

var setPassData = function setPassData(payload) {
  return {
    type: _global["default"].PASS_DATA,
    payload: payload
  };
};

exports.setPassData = setPassData;

var setPassDataClear = function setPassDataClear(id) {
  return {
    type: _global["default"].PASS_DATA_CLEAR,
    id: id
  };
};

exports.setPassDataClear = setPassDataClear;

var setAddToRedux = function setAddToRedux(payload) {
  return {
    type: payload.type,
    payload: payload
  };
};

exports.setAddToRedux = setAddToRedux;