import { useDispatch, useSelector } from "react-redux";
import { sendToProcessAction, wrapAction } from "saga-axios/core";

import { makeToUrl, makeGetUrl, withQueryParams } from "../utils/urls";
import { getFromState } from "../utils/utils";
import { setAddToRedux } from "./global.actions";

export class BaseModel {
  constructor() {
    this.effect = "replace";
    this.type = undefined;
    this.url = undefined;
  }

  static makeActionsBefore = () => [];
  static makeActions = () => [];

  static set setDispatch(dispatch) {
    this._dispatch = dispatch;
  }

  static dispatch(options) {
    return this._dispatch(options);
  }

  actionItem(options = {}) {
    const {
      id,
      url = this.url,
      method,
      actions = [],
      actionsBefore = [],
      params = [],
      payload = {},
      config = {},
      options: optionsAction = {},
    } = options;

    const { withModel = true, withUpdateRedux = true } = config;

    BaseModel.dispatch(
      sendToProcessAction({
        actionsBefore: [
          ...BaseModel.makeActionsBefore({ options, config }),
          ...actionsBefore,
        ],
        url: withQueryParams(makeGetUrl(makeToUrl(url, id), method), params),
        method,
        payload,
        options: optionsAction,
        actions: [
          ...BaseModel.makeActions({ options, config }),
          {
            on: "success",
            payload: "data",
            func: (data) => {
              if (withUpdateRedux) {
                BaseModel.dispatch(
                  this.reduxSetActionItem({ data, config, method })
                );
              }
            },
          },
          ...actions,
        ],
      })
    );
  }

  retrieveItem(options = {}) {
    this.actionItem({
      method: "GET",
      config: { withModel: false },
      ...options,
    });
  }

  createItem(options = {}) {
    this.actionItem({
      method: "POST",
      ...options,
    });
  }

  updateItem(options = {}) {
    this.actionItem({
      method: "PATCH",
      ...options,
    });
  }

  deleteItem() {
    this.actionItem({
      method: "DELETE",
      ...options,
    });
  }

  reduxSetActionItem(options = {}) {
    const { data, config = {}, method } = options;
    const { resPath = "data" } = config;

    return setAddToRedux({
      type: this.type,
      effect: getEffect({ config }),
      path: getPath({ config, this: this, method, data }),
      data: getData({ config, data, resPath }),
      ...config,
    });
  }
}

const getData = (options) => {
  const { config, data, resPath } = options;
  return config.data ? config.data : getFromState(data, resPath);
};

const getPath = (options) => {
  const { config, this: thisRef, method, data } = options;
  if (config.path) {
    return config.path;
  } else {
    if (["POST", "PATCH", "DELETE"].includes(method.toUpperCase()) !== -1) {
      return thisRef.itemsPath(data);
    } else {
      return thisRef.itemPath(thisRef.itemsPath(data), data);
    }
  }
};

const getEffect = (options) => {
  const { config } = options;
  return config.effect ? config.effect : "replace";
};
