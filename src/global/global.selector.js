import { createCachedSelector } from "re-reselect";
import { createSelectorCreator, defaultMemoize } from "reselect";
import get from "lodash.get";

const strEqual = (value, other) => {
  return JSON.stringify(value) === JSON.stringify(other);
};
const selectorState = {};
const selectById2 = (state, id, id2) => [id, id2];
export const strEqualSelector = createSelectorCreator(defaultMemoize, strEqual);

export let baseSelector = (reducer_name, path, returnDefault, config = {}) => {
  const with_func = config.with_func === undefined ? true : config.with_func;

  const func = (state) => {
    if (Array.isArray(state)) {
      return state;
    } else {
      const res = Object.values(state || {});
      return res;
    }
  };

  return makeSelector({
    baseId: reducer_name,
    path,
    returnDefault,
    with_func,
    func: with_func ? func : null,
    config,
  });
};

export const makeSelector = (options = {}) => {
  let { baseId, path, returnDefault, with_func, func } = options;

  path = makePath(path);
  baseId = `${baseId}${path}`;
  const returnDefaultNew = returnDefault === undefined ? {} : returnDefault;
  const baseIdCacheKey = `${baseId}${path}-with_func=${with_func}-returnDefault=${JSON.stringify(
    returnDefault
  )}`;

  if (getFromCache(baseIdCacheKey)) {
    return getFromCache(baseIdCacheKey);
  } else {
    const selector = factorySelector({
      baseId,
      returnDefault: returnDefaultNew,
      func,
    });
    addToCache(baseIdCacheKey, selector);
    return selector;
  }
};

export const makePath = (path) => {
  if (path === "" || path === undefined) {
    path = "";
  } else {
    path = `.${path}`;
  }
  return path;
};

export const getFromCache = (path) => {
  if (selectorState[path]) {
    return selectorState[path];
  }
};

export const factorySelector = (options) => {
  const { baseId, type = "quick", func, returnDefault } = options;
  const stateById = getChunkState(baseId);
  const cacheSelector = createCachedSelector(
    stateById,
    selectById2,
    (state, ids) => {
      const id1 = ids[0];
      const id2 = ids[1];
      if (func) {
        const stateChunk = getFromState(state, id1);
        return func(stateChunk, id2);
      }
      return getFromState(state, id1, id2 !== undefined ? id2 : returnDefault);
    }
  )({
    keySelector: (state, id) => `${baseId}.${id}_${type}`,
    selectorCreator: strEqualSelector,
  });

  return cacheSelector;
};

export const addToCache = (path, selector) => {
  selectorState[path] = selector;
};

const getChunkState = (baseId) => (state) => {
  return get(state, baseId);
};
export const getFromState = (data, path, defaultReturn) => {
  if (path === "" || !path) {
    return data || defaultReturn;
  }
  const res = get(data, path);
  return res === undefined ? defaultReturn : res;
};
