"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeSelector = exports.makePath = exports.getFromState = exports.getFromCache = exports.factorySelector = exports.baseSelector = exports.addToCache = void 0;

var _reReselect = require("re-reselect");

var _lodash = _interopRequireDefault(require("lodash.get"));

var baseSelector = function baseSelector(type, selector_type) {
  return function (path, returnDefault, config) {
    var baseId = selector_type === "base" ? "items_main" : "global_main";

    var func = function func(state) {
      if (Array.isArray(state)) {
        return state;
      } else {
        var res = Object.values(state || {});
        return res;
      }
    };

    return makeSelector({
      baseId: baseId,
      path: path,
      returnDefault: returnDefault,
      func: func,
      config: config,
      type: type
    });
  };
};

exports.baseSelector = baseSelector;

var makeSelector = function makeSelector() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var baseId = options.baseId,
      path = options.path,
      returnDefault = options.returnDefault,
      func = options.func,
      _options$config = options.config,
      config = _options$config === void 0 ? {} : _options$config;
  var _config$with_func = config.with_func,
      with_func = _config$with_func === void 0 ? true : _config$with_func;
  path = makePath(path);
  baseId = "".concat(baseId).concat(path);
  var returnDefaultNew = returnDefault === undefined ? {} : returnDefault;
  var baseIdCacheKey = "".concat(baseId).concat(path, "-with_func=").concat(with_func, "-returnDefault=").concat(JSON.stringify(returnDefault));

  if (getFromCache(baseIdCacheKey)) {
    return getFromCache(baseIdCacheKey);
  } else {
    var selector = factorySelector({
      baseId: baseId,
      returnDefault: returnDefaultNew,
      func: with_func ? func : undefined
    });
    addToCache(baseIdCacheKey, selector);
    return selector;
  }
};

exports.makeSelector = makeSelector;

var makePath = function makePath(path) {
  if (path === "" || path === undefined) {
    path = "";
  } else {
    path = ".".concat(path);
  }

  return path;
};

exports.makePath = makePath;

var getFromCache = function getFromCache(path) {
  if (selectorState[path]) {
    return selectorState[path];
  }
};

exports.getFromCache = getFromCache;

var factorySelector = function factorySelector(options) {
  var baseId = options.baseId,
      _options$type = options.type,
      type = _options$type === void 0 ? "quick" : _options$type,
      func = options.func,
      returnDefault = options.returnDefault;
  var stateById = getChunkState(baseId);
  var cacheSelector = (0, _reReselect.createCachedSelector)(stateById, selectById2, function (state, ids) {
    var id1 = ids[0];
    var id2 = ids[1];

    if (func) {
      var stateChunk = getFromState(state, id1);
      return func(stateChunk, id2);
    }

    return getFromState(state, id1, id2 !== undefined ? id2 : returnDefault);
  })({
    keySelector: function keySelector(state, id) {
      return "".concat(baseId, ".").concat(id, "_").concat(type);
    },
    selectorCreator: strEqualSelector
  });
  return cacheSelector;
};

exports.factorySelector = factorySelector;

var addToCache = function addToCache(path, selector) {
  selectorState[path] = selector;
};

exports.addToCache = addToCache;

var getChunkState = function getChunkState(baseId) {
  return function (state) {
    return (0, _lodash["default"])(state, baseId);
  };
};

var getFromState = function getFromState(data, path, defaultReturn) {
  if (path === "" || !path) {
    return data || defaultReturn;
  }

  var res = (0, _lodash["default"])(data, path);
  return res === undefined ? defaultReturn : res;
};

exports.getFromState = getFromState;