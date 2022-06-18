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
    (0, _defineProperty2["default"])(this, "itemsSelector", BaseModel.baseSelector("list", "base"));
    (0, _defineProperty2["default"])(this, "itemSelector", BaseModel.baseSelector("detail", "base"));
    (0, _defineProperty2["default"])(this, "itemsPassDataSelector", BaseModel.baseSelector("list", "passData"));
    (0, _defineProperty2["default"])(this, "itemPassDataSelector", BaseModel.baseSelector("detail", "passData"));
    (0, _defineProperty2["default"])(this, "runDebounce", null);
    this.effect = "replace";
    this.type = undefined;
    this.url = undefined;
    throw new Error("BaseModel.makeActionsBefore must be override");
  }

  (0, _createClass2["default"])(BaseModel, [{
    key: "withCache",
    value: function withCache() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var cacheKey = "".concat((0, _urls.withQueryParams)((0, _urls.makeToUrl)(this.url, options.id), options.params));
      console.log("cacheKey", cacheKey);
      console.log("BaseModel.cacheSet", BaseModel.cacheSet);
      console.log("config.withCache", options.config.withCache);
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
          detail: false,
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
          detail: true
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
          detail: true,
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
          detail: true,
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
      var fieldPath = options.fieldPath,
          fieldPathIdx = options.fieldPathIdx,
          detail = options.detail,
          data = options.data;
      var path = null;

      if (detail) {
        path = this.itemPath(this.itemsPath(data), data);
      } else {
        path = this.itemsPath(data);
      }

      console.log("path", path);

      if (fieldPath) {
        path = this.fieldPath(path, data);
      }

      console.log("path", path);

      if (fieldPathIdx && fieldPath) {
        path = this.fieldPathIdx(path, data);
      }

      return path;
    }
  }, {
    key: "itemsPath",
    value: function itemsPath(data) {
      if (data.more_data.base_item) {
        if (this.selector_type === "base") {
          return "items.".concat(data.more_data.base_item);
        } else if (this.selector_type === "passData") {
          return "passData.MainPage.".concat(data.more_data.base_item);
        }
      } else {
        if (this.selector_type === "base") {
          return "items.".concat(this.base_path);
        } else if (this.selector_type === "passData") {
          return "passData.MainPage.".concat(this.pass_data_path);
        }
      }
    }
  }, {
    key: "itemPath",
    value: function itemPath(path, data) {
      if (data.more_data.id) {
        return "".concat(path, ".").concat(data.more_data.id);
      } else if (this.selector_type === "base") {
        return "".concat(path, ".").concat(data.data.id);
      } else if (this.selector_type === "passData") {
        if (this.isList === false) {
          return "".concat(path);
        }

        return "".concat(path, ".").concat(data.more_data.id);
      }
    }
  }, {
    key: "fieldPath",
    value: function fieldPath(item_path, data) {
      if (this.selector_type === "base") {
        return "".concat(item_path, ".").concat(data.more_data.field_name);
      } else if (this.selector_type === "passData") {
        return "".concat(item_path, ".").concat(data.more_data.field_name);
      }
    }
  }, {
    key: "fieldPathIdx",
    value: function fieldPathIdx(field_path, data) {
      if (this.selector_type === "base") {
        return "".concat(field_path, ".").concat(data.more_data.field_path_idx);
      } else if (this.selector_type === "passData") {
        return "".concat(field_path, ".").concat(data.more_data.field_path_idx);
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
        detail: config.detail,
        fieldPath: config.fieldPath,
        fieldPathIdx: config.fieldPathIdx,
        data: data
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
          detail: false
        }, options.config)
      }));
    }
  }, {
    key: "reduxCreateItem",
    value: function reduxCreateItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      this.reduxActionItem(_objectSpread(_objectSpread({}, options), {}, {
        config: _objectSpread({
          detail: true,
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
          detail: true,
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
          detail: true,
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
    key: "reduxSelectItem",
    value: function reduxSelectItem() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var config = options.config,
          more_data = options.more_data,
          defaultValue = options.defaultValue;

      if (config.detail) {
        return this.selectorItem(more_data, config, defaultValue);
      } else {
        return this.selectorItems(more_data, config, defaultValue);
      }
    }
  }, {
    key: "makeSelectorPath",
    value: function makeSelectorPath(more_data, config) {
      var detail = config.detail;
      var fieldPath = config.fieldPath;
      var fieldPathIdx = config.fieldPathIdx;
      var path = config.makePath ? config.makePath(config, {
        data: {
          more_data: more_data,
          data: {}
        }
      }) : this.makePath({
        fieldPath: fieldPath,
        fieldPathIdx: fieldPathIdx,
        detail: detail,
        data: {
          more_data: more_data
        }
      });
      console.log("11path", path);
      return path; // let path = "";
      // if (more_data.base_item) {
      //   path = `${more_data.base_item}`;
      // } else if (this.selector_type === "base") {
      //   path = `${this.base_path}`;
      // } else if (this.selector_type === "passData") {
      //   path = `${this.pass_data_path}`;
      // }
      // if (config.detail) {
      //   if (this.isList === false) {
      //   } else {
      //     path = `${path}.${more_data.id}`;
      //   }
      // }
      // if (config.fieldPath) {
      //   path = `${path}.${more_data.field_name}`;
      // }
      // return path;
    }
  }, {
    key: "selectorItem",
    value: function selectorItem(more_data, config, defaultValue) {
      if (this.selector_type === "base") {
        return this.itemSelector(this.makeSelectorPath(more_data, config), defaultValue, config);
      } else if (this.selector_type === "passData") {
        return this.itemPassDataSelector(this.makeSelectorPath(more_data, config), defaultValue, config);
      }
    }
  }, {
    key: "selectorItems",
    value: function selectorItems(more_data, config, defaultValue) {
      console.log("this.selector_type", {
        selector_type: this.selector_type,
        more_data: more_data,
        config: config,
        defaultValue: defaultValue
      });

      if (this.selector_type === "base") {
        return this.itemsSelector(this.makeSelectorPath(more_data, config), defaultValue, config);
      } else if (this.selector_type === "passData") {
        return this.itemsPassDataSelector(this.makeSelectorPath(more_data, config), defaultValue, config);
      }
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
        console.log("this.runDebounce", this.runDebounce);

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
    key: "baseSelector",
    value: function baseSelector(type, type_selector) {
      return (0, _global2.baseSelector)(type, type_selector);
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