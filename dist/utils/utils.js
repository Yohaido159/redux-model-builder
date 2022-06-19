"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeByIndex = exports.processSetAddToRedux = exports.processFunctions = exports.isObjEmpty = exports.getFromState = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _lodash = _interopRequireDefault(require("lodash.get"));

var _lodash2 = _interopRequireDefault(require("lodash.set"));

var _lodash3 = _interopRequireDefault(require("lodash.setwith"));

var _lodash4 = _interopRequireDefault(require("lodash.filter"));

var _lodash5 = _interopRequireDefault(require("lodash.unset"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var getFromState = function getFromState(data, path, returnDefault) {
  if (path === "" || !path) {
    return data || returnDefault;
  }

  var res = (0, _lodash["default"])(data, path);
  return res === undefined ? returnDefault : res;
};

exports.getFromState = getFromState;

var processSetAddToRedux = function processSetAddToRedux(action, state) {
  var _arr;

  var path = action.payload.path;
  var data = action.payload.data;
  var effect = action.payload.effect;
  var nestedList = action.payload.nestedList;
  var arr = [];

  switch (effect) {
    case "replace":
      (0, _lodash2["default"])(state, path, data);
      break;

    case "push":
      arr = (0, _lodash["default"])(state, path);

      if (!arr) {
        arr = [];
      }

      arr.push(data);
      (0, _lodash3["default"])(state, path, arr, Object);
      break;

    case "modify":
      var obj = (0, _lodash["default"])(state, path);

      var new_obj = _objectSpread(_objectSpread({}, obj), data);

      (0, _lodash3["default"])(state, path, new_obj, Object);
      break;

    case "calc":
      var number = (0, _lodash["default"])(state, path);
      var newNumber = number + data;
      (0, _lodash2["default"])(state, path, newNumber);
      break;

    case "modifyNested":
      var _iterator = _createForOfIteratorHelper(nestedList),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var item = _step.value;
          (0, _lodash3["default"])(state, "".concat(path, ".").concat(item), (0, _lodash["default"])(data, item), Object);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      break;

    case "modifyList":
      arr = (0, _lodash["default"])(state, path);

      if ((0, _typeof2["default"])(arr) === "object" && isObjEmpty(arr)) {
        arr = [];
        (0, _lodash2["default"])(state, path, arr);
      } else if (arr === undefined) {
        arr = [];
      }

      (_arr = arr).push.apply(_arr, (0, _toConsumableArray2["default"])(data));

      (0, _lodash2["default"])(state, path, arr);
      break;

    case "deleteNested":
      var _iterator2 = _createForOfIteratorHelper(nestedList),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _item = _step2.value;
          (0, _lodash5["default"])(state, "".concat(path, ".").concat(_item));
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }

      break;

    case "removeFromList":
      arr = (0, _lodash["default"])(state, path);
      arr = (0, _lodash4["default"])(arr, function (value, index) {
        return index !== data;
      });
      (0, _lodash2["default"])(state, path, arr);
      break;

    case "delete":
      (0, _lodash5["default"])(state, path);
      break;

    case "popById":
      var index = path.split(".").pop();
      var newPath = path.split(".").slice(0, -1).join(".");
      arr = (0, _lodash["default"])(state, newPath);
      removeByIndex(arr, index);
      (0, _lodash2["default"])(state, newPath, arr);
      break;

    default:
      break;
  }
};

exports.processSetAddToRedux = processSetAddToRedux;

var isObjEmpty = function isObjEmpty(obj) {
  if (obj === undefined || obj === null) {
    return true;
  }

  return Object.keys(obj).length === 0;
};

exports.isObjEmpty = isObjEmpty;

var removeByIndex = function removeByIndex(list, idx) {
  list.splice(idx, 1);
  return list;
};

exports.removeByIndex = removeByIndex;

var processFunctions = function processFunctions(funcs, data) {
  // let res = "";
  // for (const func of funcs) {
  //   res = func(res, data);
  // }
  var res = funcs.reduce(function (acc, cur) {
    acc = cur(acc, data);
    return acc;
  }, "");
  return res;
};

exports.processFunctions = processFunctions;