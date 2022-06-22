import get from "lodash.get";
import set from "lodash.set";
import setWith from "lodash.setwith";
import filter from "lodash.filter";
import unset from "lodash.unset";

export const getFromState = (data, path, returnDefault) => {
  if (path === "" || !path) {
    return data || returnDefault;
  }
  const res = get(data, path);
  return res === undefined ? returnDefault : res;
};

export const processSetAddToRedux = (action, state) => {
  const path = action.payload.path;
  const data = action.payload.data;
  const effect = action.payload.effect;
  const nestedList = action.payload.nestedList;
  const func = action.payload.func;

  let arr = [];

  switch (effect) {
    case "replace":
      set(state, path, data);
      break;
    case "push":
      arr = get(state, path);
      if (!arr) {
        arr = [];
      }
      arr.push(data);
      setWith(state, path, arr, Object);
      break;
    case "modify":
      let obj = get(state, path);
      let new_obj = { ...obj, ...data };
      setWith(state, path, new_obj, Object);
      break;
    case "calc":
      let number = get(state, path);
      let newNumber = number + data;
      set(state, path, newNumber);
      break;
    case "modifyNested":
      for (let item of nestedList) {
        setWith(state, `${path}.${item}`, get(data, item), Object);
      }
      break;
    case "modifyList":
      arr = get(state, path);
      if (typeof arr === "object" && isObjEmpty(arr)) {
        arr = [];
        set(state, path, arr);
      } else if (arr === undefined) {
        arr = [];
      }
      arr.push(...data);
      set(state, path, arr);

      break;
    case "deleteNested":
      for (let item of nestedList) {
        unset(state, `${path}.${item}`);
      }
      break;
    case "removeFromList":
      arr = get(state, path);
      arr = filter(arr, (value, index) => index !== data);
      set(state, path, arr);
      break;
    case "delete":
      unset(state, path);
      break;
    case "popById":
      let index = path.split(".").pop();
      let newPath = path.split(".").slice(0, -1).join(".");
      arr = get(state, newPath);
      removeByIndex(arr, index);
      set(state, newPath, arr);
      break;
    default:
      break;
  }
  if (func) {
    const res = func(state);
    // if (res === "exit") return;
  }
};

export const isObjEmpty = (obj) => {
  if (obj === undefined || obj === null) {
    return true;
  }
  return Object.keys(obj).length === 0;
};

export const removeByIndex = (list, idx) => {
  list.splice(idx, 1);
  return list;
};

export const processFunctions = (funcs, data) => {
  // let res = "";
  // for (const func of funcs) {
  //   res = func(res, data);
  // }
  const res = funcs.reduce((acc, cur) => {
    acc = cur(acc, data);
    return acc;
  }, "");
  return res;
};
