import globalTypes from "./global.types";
import {
  takeLatest,
  put,
  fork,
  select,
  takeEvery,
  delay,
  call,
  cancel,
} from "redux-saga/effects";
import axios from "axios";
import omit from "lodash.omit";
import get from "lodash.get";

import { getUserToken, removeUserToken } from "../utils/utils";

export function* sagaSendToProcess(action) {
  let {
    url,
    method,
    payload,
    actions = [],
    actionsBefore = [],
    options = {},
    out_state = {},
  } = action;

  const {
    withToken = true,
    contentType = "application/json",
    config = {},
  } = options;

  let headers = {};
  if (withToken) {
    const token = getUserToken();
    headers.Authorization = `JWT ${token}`;
  }

  if (contentType === "multipart/form-data") {
    const formData = new FormData();
    for (let [key, value] of Object.entries(payload)) {
      formData.append(key, value);
    }
    payload = formData;
  }
  const withError = yield call(processActions, { actions: actionsBefore });
  if (withError) return;

  let res = {};
  try {
    method = method.toUpperCase();
    if (method === "GET") {
      res = yield call(axios.get, url, { ...config, headers });
    } else if (method === "POST") {
      res = yield call(axios.post, url, payload, { ...config, headers });
    } else if (method === "PUT") {
      res = yield call(axios.put, url, payload, { ...config, headers });
    } else if (method === "PATCH") {
      res = yield call(axios.patch, url, payload, { ...config, headers });
    } else if (method === "DELETE") {
      res = yield call(axios.delete, url, { ...config, headers });
    }
    yield call(sagaProcessAfterSend, {
      actions,
      options: { data: res, more_data: { isSuccess: true, out_state } },
    });
  } catch (err) {
    console.log(`err in send ${method}`, err);
    try {
      yield call(sagaProcessAfterSend, {
        actions,
        options: { data: err, more_data: { isSuccess: false, out_state } },
      });
    } catch (err2) {
      console.log("err in sagaProcessAfterSend", err2);
    }
  }
}

export function* sagaProcessAfterSend(action) {
  const { actions, options = {} } = action;
  const { data, more_data } = options;
  let actionsAfterSuccess = actions.filter((action) => {
    return (
      action.on.toUpperCase() === "SUCCESS" || action.on.toUpperCase() === "ANY"
    );
  });
  let actionsAfterFail = actions.filter((action) => {
    return action.on === "FAIL" || action.on.toUpperCase() === "ANY";
  });

  if (more_data.isSuccess === true) {
    console.log("actionsAfterSuccess", actionsAfterSuccess);
    yield call(processActions, {
      actions: actionsAfterSuccess,
      options: { data, more_data },
    });
  } else {
    yield call(processActions, {
      actions: actionsAfterFail,
      options: { data, more_data },
    });
  }
}

export function* processActions(action) {
  const { actions = [], options = {} } = action;
  let { data = {}, more_data = {} } = options;
  let result_data = {};
  try {
    if (more_data.isSuccess === false) {
      data = get(data, "response");
      try {
        const code = get(data, "data.code");
        switch (code) {
          case "user_not_found":
            removeUserToken();
            break;
          case "token_not_valid":
            removeUserToken();
            break;
          default:
            break;
        }
      } catch (e) {}
    }
    for (let actionInList of actions) {
      const func = actionInList.func;

      if (actionInList.payload || actionInList.payload === "") {
        if (actionInList.payload === "") {
          result_data = data;
        } else {
          result_data = get(data, actionInList.payload);
        }
      }
      const res = yield func(result_data, more_data.out_state);
      const withError = get(res, "withError");
      if (withError) {
        return withError;
      }
    }
  } catch (err3) {
    console.log("err in processActions", err3);
  }
}

export function* sagaSendToSagaProcessTakeEveryStart() {
  yield takeEvery(
    globalTypes.SAGA_SEND_TO_SAGA_PROCESS_TAKE_EVERY,
    sagaSendToProcess
  );
}
