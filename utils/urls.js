import endswith from "lodash.endswith";

export const withQueryParams = (url, params = []) => {
  let newUrl = addBackslash(url);
  if (params.length > 0) {
    let paramsString = params.join(`&`);
    return `${newUrl}?${paramsString}`;
  } else {
    return `${newUrl}`;
  }
};

export const makeGetUrl = (url, method = "") => {
  if (method.toLowerCase() === "get") {
    let newUrl = removeBackslash(url);
    return `${newUrl}_get/`;
  } else {
    return url;
  }
};
export const removeBackslash = (url) => {
  let newUrl = url;
  if (endswith(newUrl, `/`)) {
    newUrl = `${newUrl.slice(0, -1)}`;
  }
  return newUrl;
};
export const makeToUrl = (url, id) => {
  if (id) {
    let newUrl = removeBackslash(url);
    return `${newUrl}/${id}/`;
  } else {
    return url;
  }
};

export const addBackslash = (url) => {
  let newUrl = url;
  if (!endswith(newUrl, `/`)) {
    newUrl = `${newUrl}/`;
  }
  return newUrl;
};
