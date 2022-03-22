import globalTypes from "./global.types";

export const sendToProcess = (action) => {
  return {
    type: globalTypes.SAGA_SEND_TO_SAGA_PROCESS_TAKE_EVERY,
    ...action,
  };
};

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
