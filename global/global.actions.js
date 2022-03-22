import globalTypes from "./global.types";

export const setPassData = (payload) => ({
  type: globalTypes.PASS_DATA,
  payload,
});

export const setPassDataClear = (id) => ({
  type: globalTypes.PASS_DATA_CLEAR,
  id,
});

export const setAddToRedux = (payload) => {
  return {
    type: payload.type,
    payload,
  };
};
