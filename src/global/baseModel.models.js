import { useDispatch, useSelector } from "react-redux";
import { sendToProcessAction, wrapAction } from "saga-axios/dist/core";
import debounce from "lodash.debounce";

import { makeToUrl, withQueryParams } from "../utils/urls";
import { getFromState } from "../utils/utils";
import { setAddToRedux } from "./global.actions";
import { baseSelector } from "./global.selector";

export class BaseModel {
  constructor() {
    this.effect = "replace";
    this.type = undefined;
    this.url = undefined;
  }

  static makeActionsBefore = ({ options, config }) => [];
  static makeActions = ({ options, config }) => [];

  static set setDispatch(dispatch) {
    if (dispatch) {
      this._dispatch = dispatch;
    }
  }

  static dispatch(options) {
    return this._dispatch(options);
  }

  static makeActionsConst = ({ options, config, method }) => [{}];

  withCache(options = {}) {
    const cacheKey = `${withQueryParams(
      makeToUrl(this.url, options.id),
      options.params
    )}`;
    return cacheKey;
  }

  static cacheSet = new Set();

  actionItem(options = {}) {
    let {
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

    method = method.toUpperCase();

    const { withModel = true, withUpdateRedux = true } = config;
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

    BaseModel.dispatch(
      sendToProcessAction({
        actionsBefore: [
          ...BaseModel.makeActionsBefore({ options, config }),
          ...actionsBefore,
        ],
        url: withQueryParams(makeToUrl(url, id), params),
        method,
        payload,
        options: optionsAction,
        actions: [
          ...BaseModel.makeActions({ options, config }),
          {
            on: "success",
            payload: "data",
            func: (data) => {
              if (config.withUpdateRedux) {
                let newData = this.preProcessData(data, config);
                console.log("newData", newData);
                if (method === "GET") {
                  this.reduxRetrieveItem({ config, data: newData });
                } else if (method === "POST") {
                  this.reduxCreateItem({ config, data: newData });
                } else if (method === "PATCH") {
                  this.reduxUpdateItem({ config, data: newData });
                } else if (method === "DELETE") {
                  this.reduxDeleteItem({ config, data: newData });
                }
              }
            },
          },
          ...actions,
        ],
      })
    );
  }

  retrieveItem(options = {}) {
    console.log("retrieveItem options", options);
    this.actionItem({
      method: "GET",
      ...options,
      config: {
        effect: "replace",
        detail: false,
        withModel: false,
        ...options.config,
      },
    });
  }

  createItem(options = {}) {
    console.log("createItem options", options);
    this.actionItem({
      method: "POST",
      config: {
        effect: "replace",
        detail: true,
        ...options.config,
      },
      ...options,
    });
  }

  updateItem(options = {}) {
    this.actionItem({
      method: "PATCH",
      config: {
        detail: true,
        effect: "modify",
        ...options.config,
      },
      ...options,
    });
  }

  deleteItem(options = {}) {
    this.actionItem({
      method: "DELETE",
      ...options,
      config: {
        detail: true,
        effect: "delete",
        ...options.config,
      },
    });
  }

  makeType(options = {}) {
    const { base_type } = options;
    if (this.selector_type === "passData") {
      return "GLOBAL_ADD_TO_REDUX";
    }
    return `${base_type}`;
  }

  makePath(options = {}) {
    const { fieldPath, fieldPathIdx, detail, data } = options;
    let path = null;

    if (detail) {
      path = this.itemPath(this.itemsPath(data), data);
    } else {
      path = this.itemsPath(data);
    }

    if (fieldPath) {
      path = this.fieldPath(path, data);
    }
    if (fieldPathIdx && fieldPath) {
      path = this.fieldPathIdx(path, data);
    }
    return path;
  }

  itemsPath(data) {
    if (data.more_data.base_item) {
      if (this.selector_type === "base") {
        return `items.${data.more_data.base_item}`;
      } else if (this.selector_type === "passData") {
        return `passData.MainPage.${data.more_data.base_item}`;
      }
    } else {
      if (this.selector_type === "base") {
        return `items.${this.base_path}`;
      } else if (this.selector_type === "passData") {
        return `passData.MainPage.${this.pass_data_path}`;
      }
    }
  }

  itemPath(path, data) {
    if (data.more_data.id) {
      return `${path}.${data.more_data.id}`;
    } else if (this.selector_type === "base") {
      return `${path}.${data.data.id}`;
    } else if (this.selector_type === "passData") {
      if (this.isList === false) {
        return `${path}`;
      }
      return `${path}.${data.more_data.id}`;
    }
  }

  fieldPath(item_path, data) {
    if (this.selector_type === "base") {
      return `${item_path}.${data.more_data.field_name}`;
    } else if (this.selector_type === "passData") {
      return `${item_path}.${data.more_data.field_name}`;
    }
  }
  fieldPathIdx(field_path, data) {
    if (this.selector_type === "base") {
      return `${field_path}.${data.more_data.field_path_idx}`;
    } else if (this.selector_type === "passData") {
      return `${field_path}.${data.more_data.field_path_idx}`;
    }
  }

  reduxActionItem(options = {}) {
    const { config = {}, data } = options;
    let path = config.makePath
      ? config.makePath(config, data)
      : this.makePath({
          detail: config.detail,
          fieldPath: config.fieldPath,
          fieldPathIdx: config.fieldPathIdx,
          data,
        });
    this.makeDelay(config, BaseModel.dispatch.bind(BaseModel), [
      this.reduxSetActionItem({
        ...options,
        path,
      }),
    ]);
  }

  reduxRetrieveItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        effect: "replace",
        detail: false,
        ...options.config,
      },
    });
  }
  reduxCreateItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        detail: true,
        effect: "replace",
        ...options.config,
      },
    });
  }
  reduxUpdateItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        detail: true,
        effect: "modify",
        ...options.config,
      },
    });
  }
  reduxDeleteItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        detail: true,
        effect: "delete",
        ...options.config,
      },
    });
  }

  reduxSetActionItem(options = {}) {
    const { data, config = {}, path } = options;
    const { resPath = "data" } = config;
    return setAddToRedux({
      type: this.type,
      effect: getEffect({ config }),
      path,
      data: getData({ config, data, resPath }),
      ...config,
    });
  }

  newItemsPath(data_wrap = {}) {
    if (data_wrap.postfix) {
      return `${this.base_path}.${data_wrap.postfix}`;
    }
    return this.base_path;
  }

  newItemPath(data_wrap = {}) {
    const prev_path = this.newItemsPath(data_wrap);
    return `${prev_path}.${data_wrap.id}`;
  }

  newFieldPath(data_wrap = {}) {
    const prev_path = this.newItemPath(data_wrap);
    return `${prev_path}.${data_wrap.field_name}`;
  }

  selectAll(options = {}) {
    const { data_wrap, returnDefault } = options;

    const path = this.newItemsPath(data_wrap);

    return baseSelector(this.reducer_name, path, returnDefault);
  }

  selectGetById(options) {
    const { data_wrap, returnDefault } = options;
    const path = this.newItemPath(data_wrap);
    return baseSelector(this.reducer_name, path, returnDefault, {
      with_func: false,
    });
  }

  selectField(options) {
    const { data_wrap, returnDefault } = options;
    const path = this.newFieldPath(data_wrap);
    return baseSelector(this.reducer_name, path, returnDefault, {
      with_func: false,
    });
  }

  preProcessData(data, config) {
    return data;
  }

  runDebounce = null;

  makeDelay(config, func, args) {
    const delay = config.delay;
    if (delay) {
      console.log("this.runDebounce", this.runDebounce);
      if (this.runDebounce) {
        this.runDebounce(...args);
      } else {
        this.runDebounce = debounce(func, delay);
      }
    } else {
      func(...args);
    }
  }
}

const getData = (options) => {
  const { config, data, resPath } = options;
  return config.data ? config.data : getFromState(data, resPath);
};

const getEffect = (options) => {
  const { config } = options;
  return config.effect ? config.effect : "replace";
};
