import get from "lodash.get";

export const getFromState = (data, path, defaultReturn) => {
  if (path === "" || !path) {
    return data || defaultReturn;
  }
  const res = get(data, path);
  return res === undefined ? defaultReturn : res;
};
