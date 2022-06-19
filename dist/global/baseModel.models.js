"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BaseModel = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _reactRedux = require("react-redux");

var _core = require("saga-axios/dist/core");

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _urls = require("../utils/urls");

var _utils = require("../utils/utils");

var _global = require("./global.actions");

var _global2 = require("./global.selector");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var BaseModel = /*#__PURE__*/function () {
  function BaseModel() {
    (0, _classCallCheck2["default"])(this, BaseModel);
    (0, _defineProperty2["default"])(this, "runDebounce", null);
    this.effect = "replace";
    this.type = undefined;
    this.url = undefined;
  }

  (0, _createClass2["default"])(BaseModel, [{
    key: "withCache",
    value: function withCache() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var cacheKey = "".concat((0, _urls.withQueryParams)((0, _urls.makeToUrl)(this.url, options.id), options.params));
      return cacheKey;
    }
  }, {
    key: "actionItem",
    value: function actionItem() {
      var _this = this;

      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var id = options.id,
          _options$url = options.url,
          url = _options$url === void 0 ? this.url : _options$url,
          method = options.method,
          _options$actions = options.actions,
          actions = _options$actions === void 0 ? [] : _options$actions,
          _options$actionsBefor = options.actionsBefore,
          actionsBefore = _options$actionsBefor === void 0 ? [] : _options$actionsBefor,
          _options$params = options.params,
          params = _options$params === void 0 ? [] : _options$params,
          _options$payload = options.payload,
          payload = _options$payload === void 0 ? {} : _options$payload,
          _options$config = options.config,
          config = _options$config === void 0 ? {} : _options$config,
          _options$options = options.options,
          optionsAction = _options$options === void 0 ? {} : _options$options;
      method = method.toUpperCase();
      var _config$withModel = config.withModel,
          withModel = _config$withModel === void 0 ? true : _config$withModel,
          _config$withUpdateRed = config.withUpdateRedux,
          withUpdateRedux = _config$withUpdateRed === void 0 ? true : _config$withUpdateRed;
      config.withModel = withModel;
      config.withUpdateRedux = withUpdateRedux;

      if (method.toUpperCase() === "GET") {
        if (config.withCache === undefined) {
          config.withCache = true;
        }
      }

      if (config.withCache) {
        if (BaseModel.cacheSet.has(this.withCache(options))) {
          return;
        } else {
          BaseModel.cacheSet.add(this.withCache(options));
        }
      }

      BaseModel.dispatch((0, _core.sendToProcessAction)({
        actionsBefore: [].concat((0, _toConsumableArray2["default"])(BaseModel.makeActionsBefore({
          options: options,
          config: config
        })), (0, _toConsumableArray2["default"])(actionsBefore)),
        url: (0, _urls.withQueryParams)((0, _urls.makeToUrl)(url, id), params),
        method: method,
        payload: payload,
        options: optionsAction,
        actions: [].concat((0, _toConsumableArray2["default"])(BaseModel.makeActions({
          options: options,
          config: config
        })), [{
          on: "success",
          payload: "data",
          func: function func(data) {
            if (config.withUpdateRedux) {
              var newData = _this.preProcessData(data, config);

              console.log("newData", newData);

              if (method === "GET") {
                _this.reduxRetrieveItem({
                  config: config,
                  data: newData
                });
              } else if (method === "POST") {
                _this.reduxCreateItem({
                  config: config,
                  data: newData
                });
              } else if (method === "PATCH") {
                _this.reduxUpdateItem({
                  config: config,
                  data: newData
                });
              } else if (method === "DELETE") {
                _this.reduxDeleteItem({
                  config: config,
                  data: newData
                });
              }
            }
          }
        }], (0, _toConsumableArray2["default"])(actions))
      }));
    }
  }, {
    key: "retrieveItem",
    value: function retrieveItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log("retrieveItem options", options);
      this.actionItem(_objectSpread(_objectSpread({
        method: "GET"
      }, options), {}, {
        config: _objectSpread({
          effect: "replace",
          // detail: false,
          isMany: true,
          withModel: false
        }, options.config)
      }));
    }
  }, {
    key: "createItem",
    value: function createItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      console.log("createItem options", options);
      this.actionItem(_objectSpread({
        method: "POST",
        config: _objectSpread({
          effect: "replace",
          // detail: true,
          isOne: true
        }, options.config)
      }, options));
    }
  }, {
    key: "updateItem",
    value: function updateItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.actionItem(_objectSpread({
        method: "PATCH",
        config: _objectSpread({
          // detail: true,
          isOne: true,
          effect: "modify"
        }, options.config)
      }, options));
    }
  }, {
    key: "deleteItem",
    value: function deleteItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.actionItem(_objectSpread(_objectSpread({
        method: "DELETE"
      }, options), {}, {
        config: _objectSpread({
          // detail: true,
          isOne: true,
          effect: "delete"
        }, options.config)
      }));
    }
  }, {
    key: "makeType",
    value: function makeType() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var base_type = options.base_type;

      if (this.selector_type === "passData") {
        return "GLOBAL_ADD_TO_REDUX";
      }

      return "".concat(base_type);
    }
  }, {
    key: "makePath",
    value: function makePath() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var isMany = options.isMany,
          isOne = options.isOne,
          isField = options.isField,
          wrap_data = options.wrap_data;

      if (isField) {
        return this.fieldPath(this.itemPath(this.postfixPath(this.itemsPath(wrap_data), wrap_data), wrap_data), wrap_data);
      } else if (isOne) {
        return this.itemPath(this.postfixPath(this.itemsPath(wrap_data), wrap_data), wrap_data);
      } else if (isMany) {
        return this.postfixPath(this.itemsPath(wrap_data), wrap_data);
      }
    }
  }, {
    key: "reduxActionItem",
    value: function reduxActionItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _options$config2 = options.config,
          config = _options$config2 === void 0 ? {} : _options$config2,
          data = options.data;
      var path = config.makePath ? config.makePath(config, data) : this.makePath({
        // detail: config.detail,
        // fieldPath: config.fieldPath,
        // fieldPathIdx: config.fieldPathIdx,
        isMany: config.isMany,
        isOne: config.isOne,
        isField: config.isField,
        wrap_data: data.more_data
      });
      this.makeDelay(config, BaseModel.dispatch.bind(BaseModel), [this.reduxSetActionItem(_objectSpread(_objectSpread({}, options), {}, {
        path: path
      }))]);
    }
  }, {
    key: "reduxRetrieveItem",
    value: function reduxRetrieveItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.reduxActionItem(_objectSpread(_objectSpread({}, options), {}, {
        config: _objectSpread({
          effect: "replace",
          // detail: false,
          isMany: true
        }, options.config)
      }));
    }
  }, {
    key: "reduxCreateItem",
    value: function reduxCreateItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.reduxActionItem(_objectSpread(_objectSpread({}, options), {}, {
        config: _objectSpread({
          // detail: true,
          isOne: true,
          effect: "replace"
        }, options.config)
      }));
    }
  }, {
    key: "reduxUpdateItem",
    value: function reduxUpdateItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.reduxActionItem(_objectSpread(_objectSpread({}, options), {}, {
        config: _objectSpread({
          // detail: true,
          isOne: true,
          effect: "modify"
        }, options.config)
      }));
    }
  }, {
    key: "reduxDeleteItem",
    value: function reduxDeleteItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.reduxActionItem(_objectSpread(_objectSpread({}, options), {}, {
        config: _objectSpread({
          // detail: true,
          isOne: true,
          effect: "delete"
        }, options.config)
      }));
    }
  }, {
    key: "reduxSetActionItem",
    value: function reduxSetActionItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var data = options.data,
          _options$config3 = options.config,
          config = _options$config3 === void 0 ? {} : _options$config3,
          path = options.path;
      var _config$resPath = config.resPath,
          resPath = _config$resPath === void 0 ? "data" : _config$resPath;
      return (0, _global.setAddToRedux)(_objectSpread({
        type: this.type,
        effect: getEffect({
          config: config
        }),
        path: path,
        data: getData({
          config: config,
          data: data,
          resPath: resPath
        })
      }, config));
    }
  }, {
    key: "itemsPath",
    value: function itemsPath() {
      var wrap_data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      return this.base_path;
    }
  }, {
    key: "itemPath",
    value: function itemPath(prev_path) {
      var wrap_data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.is_singular) {
        return prev_path;
      }

      return "".concat(prev_path, ".").concat(wrap_data.id);
    }
  }, {
    key: "fieldPath",
    value: function fieldPath(prev_path) {
      var wrap_data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return "".concat(prev_path, ".").concat(wrap_data.field_name);
    }
  }, {
    key: "postfixPath",
    value: function postfixPath(path) {
      var wrap_data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (wrap_data.postfix) {
        return "".concat(path, ".").concat(wrap_data.postfix);
      }

      return path;
    }
  }, {
    key: "selectAll",
    value: function selectAll(wrap_data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var returnDefault = options.returnDefault,
          _options$with_func = options.with_func,
          with_func = _options$with_func === void 0 ? true : _options$with_func;
      var path = this.makePath({
        wrap_data: wrap_data,
        isMany: true
      });
      return (0, _global2.baseSelector)(this.reducer_name, path, returnDefault, {
        with_func: with_func
      });
    }
  }, {
    key: "selectItem",
    value: function selectItem(wrap_data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var returnDefault = options.returnDefault,
          _options$with_func2 = options.with_func,
          with_func = _options$with_func2 === void 0 ? false : _options$with_func2;
      var path = this.makePath({
        wrap_data: wrap_data,
        isMany: true
      });
      return (0, _global2.baseSelector)(this.reducer_name, path, returnDefault, {
        with_func: with_func
      });
    }
  }, {
    key: "selectGetById",
    value: function selectGetById(wrap_data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var returnDefault = options.returnDefault,
          config = options.config;
      var path = this.makePath({
        wrap_data: wrap_data,
        isOne: true
      });
      return (0, _global2.baseSelector)(this.reducer_name, path, returnDefault, {
        with_func: false
      });
    }
  }, {
    key: "selectField",
    value: function selectField(wrap_data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var returnDefault = options.returnDefault,
          config = options.config;
      var path = this.makePath({
        wrap_data: wrap_data,
        isField: true
      });
      console.log("🚀 ~ file: baseModel.models.js ~ line 333 ~ BaseModel ~ selectField ~ path", path);
      return (0, _global2.baseSelector)(this.reducer_name, path, returnDefault, {
        with_func: false
      });
    }
  }, {
    key: "preProcessData",
    value: function preProcessData(data, config) {
      return data;
    }
  }, {
    key: "makeDelay",
    value: function makeDelay(config, func, args) {
      var delay = config.delay;

      if (delay) {
        if (this.runDebounce) {
          this.runDebounce.apply(this, (0, _toConsumableArray2["default"])(args));
        } else {
          this.runDebounce = (0, _lodash["default"])(func, delay);
        }
      } else {
        func.apply(void 0, (0, _toConsumableArray2["default"])(args));
      }
    }
  }], [{
    key: "setDispatch",
    set: function set(dispatch) {
      if (dispatch) {
        this._dispatch = dispatch;
      }
    }
  }, {
    key: "dispatch",
    value: function dispatch(options) {
      return this._dispatch(options);
    }
  }]);
  return BaseModel;
}();

exports.BaseModel = BaseModel;
(0, _defineProperty2["default"])(BaseModel, "makeActionsBefore", function (_ref) {
  var options = _ref.options,
      config = _ref.config;
  return [];
});
(0, _defineProperty2["default"])(BaseModel, "makeActions", function (_ref2) {
  var options = _ref2.options,
      config = _ref2.config;
  return [];
});
(0, _defineProperty2["default"])(BaseModel, "makeActionsConst", function (_ref3) {
  var options = _ref3.options,
      config = _ref3.config,
      method = _ref3.method;
  return [{}];
});
(0, _defineProperty2["default"])(BaseModel, "cacheSet", new Set());

var getData = function getData(options) {
  var config = options.config,
      data = options.data,
      resPath = options.resPath;
  return config.data ? config.data : (0, _utils.getFromState)(data, resPath);
};

var getEffect = function getEffect(options) {
  var config = options.config;
  return config.effect ? config.effect : "replace";
};