import { BaseModel } from "../baseModel.models";
import { sendToProcessAction } from "saga-axios/dist/core";

BaseModel.setDispatch = jest.fn();

let baseModel = null;

describe("test the base model class", () => {
  beforeEach(() => {
    baseModel = new BaseModel();
    baseModel.actionItem = jest.fn();
  });

  test("should test retrieveItem ", () => {
    const options = {
      method: "GET",
      config: { withModel: false },
    };
    baseModel.retrieveItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
  test("should test createItem ", () => {
    const options = {
      method: "POST",
    };
    baseModel.createItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
  test("should test updateItem ", () => {
    const options = {
      method: "PATCH",
    };
    baseModel.updateItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
  test("should test deleteItem ", () => {
    const options = {
      method: "DELETE",
    };
    baseModel.deleteItem(options);
    expect(baseModel.actionItem).toBeCalledWith(options);
  });
});

describe("test the actionItem method", () => {
  beforeEach(() => {
    baseModel = new BaseModel();
    BaseModel.dispatch = jest.fn();
  });

  test("test the actionItem method", () => {
    baseModel.url = "test_url";
    const options = {
      method: "GET",
      config: { withModel: false, withUpdateRedux: true },
    };

    BaseModel.makeActions = () => [];
    BaseModel.makeActionsBefore = () => [];
    BaseModel.makeActionsConst = () => [];

    baseModel.actionItem(options);
    expect(BaseModel.dispatch).toBeCalledWith(
      sendToProcessAction({
        method: "GET",
        url: "test_url_get/",
        actions: [...BaseModel.makeActions()],
        actionsBefore: [...BaseModel.makeActionsBefore()],
        options: {},
        payload: {},
      })
    );
  });
});
