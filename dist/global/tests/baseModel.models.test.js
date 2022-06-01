"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _baseModel = require("../baseModel.models");

var _core = require("saga-axios/dist/core");

_baseModel.BaseModel.setDispatch = jest.fn();
var baseModel = null;
describe("test the base model class", function () {
  beforeEach(function () {
    baseModel = new _baseModel.BaseModel();
    baseModel.actionItem = jest.fn();
  });
  test("should test retrieveItem ", function () {
    var options = {
      method: "GET",
      config: {
        withModel: false
      }
    };
    baseModel.retrieveItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
  test("should test createItem ", function () {
    var options = {
      method: "POST"
    };
    baseModel.createItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
  test("should test updateItem ", function () {
    var options = {
      method: "PATCH"
    };
    baseModel.updateItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
  test("should test deleteItem ", function () {
    var options = {
      method: "DELETE"
    };
    baseModel.deleteItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
});
describe("test the actionItem method", function () {
  beforeEach(function () {
    baseModel = new _baseModel.BaseModel();
    _baseModel.BaseModel.dispatch = jest.fn();
  });
  test("test the actionItem method", function () {
    baseModel.url = "test_url";
    var options = {
      method: "GET",
      config: {
        withModel: false,
        withUpdateRedux: true
      }
    };

    _baseModel.BaseModel.makeActions = function () {
      return [];
    };

    _baseModel.BaseModel.makeActionsBefore = function () {
      return [];
    };

    _baseModel.BaseModel.makeActionsConst = function () {
      return [];
    };

    baseModel.actionItem(options);
    expect(_baseModel.BaseModel.dispatch).toBeCalledWith((0, _core.sendToProcessAction)({
      method: "GET",
      url: "test_url_get/",
      actions: (0, _toConsumableArray2["default"])(_baseModel.BaseModel.makeActions()),
      actionsBefore: (0, _toConsumableArray2["default"])(_baseModel.BaseModel.makeActionsBefore()),
      options: {},
      payload: {}
    }));
  });
});