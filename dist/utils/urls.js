"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.withQueryParams = exports.removeBackslash = exports.makeToUrl = exports.makeGetUrl = exports.addBackslash = void 0;

var _lodash = _interopRequireDefault(require("lodash.endswith"));

var withQueryParams = function withQueryParams(url) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var newUrl = addBackslash(url);

  if (params.length > 0) {
    var paramsString = params.join("&");
    return "".concat(newUrl, "?").concat(paramsString);
  } else {
    return "".concat(newUrl);
  }
};

exports.withQueryParams = withQueryParams;

var makeGetUrl = function makeGetUrl(url) {
  var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

  if (method.toLowerCase() === "get") {
    var newUrl = removeBackslash(url);
    return "".concat(newUrl, "_get/");
  } else {
    return url;
  }
};

exports.makeGetUrl = makeGetUrl;

var removeBackslash = function removeBackslash(url) {
  var newUrl = url;

  if ((0, _lodash["default"])(newUrl, "/")) {
    newUrl = "".concat(newUrl.slice(0, -1));
  }

  return newUrl;
};

exports.removeBackslash = removeBackslash;

var makeToUrl = function makeToUrl(url, id) {
  if (id) {
    var newUrl = removeBackslash(url);
    return "".concat(newUrl, "/").concat(id, "/");
  } else {
    return url;
  }
};

exports.makeToUrl = makeToUrl;

var addBackslash = function addBackslash(url) {
  var newUrl = url;

  if (!(0, _lodash["default"])(newUrl, "/")) {
    newUrl = "".concat(newUrl, "/");
  }

  return newUrl;
};

exports.addBackslash = addBackslash;