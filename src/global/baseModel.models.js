import { useDispatch, useSelector } from "react-redux";
import { sendToProcessAction, wrapAction } from "saga-axios/dist/core";
import debounce from "lodash.debounce";

import { makeToUrl, withQueryParams } from "../utils/urls";
import { getFromState, processFunctions } from "../utils/utils";
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
        // detail: false,
        isMany: true,
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

        isOne: true,
        ...options.config,
      },
      ...options,
    });
  }

  updateItem(options = {}) {
    this.actionItem({
      method: "PATCH",
      config: {
        isOne: true,
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
        isOne: true,
        effect: "delete",
        ...options.config,
      },
    });
  }

  makePath(options = {}) {
    const { isMany, isOne, isField, wrap_data } = options;
    if (isField) {
      return this.fieldPath(
        this.itemPath(
          this.addfixPath(this.itemsPath(wrap_data), wrap_data),
          wrap_data
        ),
        wrap_data
      );
    } else if (isOne) {
      return this.itemPath(
        this.addfixPath(this.itemsPath(wrap_data), wrap_data),
        wrap_data
      );
    } else if (isMany) {
      return this.addfixPath(this.itemsPath(wrap_data), wrap_data);
    }
  }

  reduxActionItem(options = {}) {
    const { config = {}, data } = options;
    let path = config.makePath
      ? config.makePath(config, data)
      : this.makePath({
          // detail: config.detail,
          // fieldPath: config.fieldPath,
          // fieldPathIdx: config.fieldPathIdx,
          isMany: config.isMany,
          isOne: config.isOne,
          isField: config.isField,
          wrap_data: data.more_data,
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
        // detail: false,
        isMany: true,
        ...options.config,
      },
    });
  }
  reduxCreateItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        isOne: true,
        effect: "replace",
        ...options.config,
      },
    });
  }
  reduxUpdateItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        isOne: true,
        effect: "modify",
        ...options.config,
      },
    });
  }
  reduxDeleteItem(options = {}) {
    this.reduxActionItem({
      ...options,
      config: {
        isOne: true,
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

  itemsPath(wrap_data = {}) {
    return this.base_path;
  }

  itemPath(prev_path, wrap_data = {}) {
    if (this.is_singular) {
      return prev_path;
    }
    return `${prev_path}.${wrap_data.id}`;
  }

  fieldPath(prev_path, wrap_data = {}) {
    return `${prev_path}.${wrap_data.field_name}`;
  }

  addfixPath(path, wrap_data = {}) {
    let newPath = path;
    if (wrap_data.postfix) {
      newPath = `${newPath}.${wrap_data.postfix}`;
    } else if (wrap_data.prefix) {
      newPath = `${wrap_data.prefix}.${newPath}`;
    }
    if (this.selector_type === "temp") {
      newPath = `temp.${newPath}`;
    }
    return newPath;
  }

  selectAll(wrap_data, options = {}) {
    const { returnDefault, with_func = true } = options;
    const path = this.makePath({
      wrap_data,
      isMany: true,
    });
    return baseSelector(this.reducer_name, path, returnDefault, { with_func });
  }

  selectItem(wrap_data, options = {}) {
    const { returnDefault, with_func = false } = options;
    const path = this.makePath({
      wrap_data,
      isMany: true,
    });
    return baseSelector(this.reducer_name, path, returnDefault, {
      with_func,
    });
  }

  selectGetById(wrap_data, options = {}) {
    const { returnDefault, config } = options;
    const path = this.makePath({
      wrap_data,
      isOne: true,
    });
    return baseSelector(this.reducer_name, path, returnDefault, {
      with_func: false,
    });
  }

  selectField(wrap_data, options = {}) {
    const { returnDefault = "", config } = options;
    const path = this.makePath({
      wrap_data,
      isField: true,
    });
    console.log(
      "🚀 ~ file: baseModel.models.js ~ line 321 ~ BaseModel ~ selectField ~ returnDefault",
      returnDefault
    );
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
