export const getUserToken = () => {
  let token =
    window.localStorage.getItem("token") ||
    window.sessionStorage.getItem("token") ||
    null;
  return token;
};

export const removeUserToken = () => {
  window.localStorage.removeItem("token");
  window.sessionStorage.removeItem("token");
  window.localStorage.setItem("logout", Date.now().toString());
  window.localStorage.removeItem("logout");
};

export const wrapAction = (options) => {
  const {
    on = "success",
    payload = "data",
    func = () => {},
    actions = [],
  } = options;

  return {
    on,
    payload,
    func,
    actions,
  };
};
