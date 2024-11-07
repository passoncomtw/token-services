import { put, select, call } from 'redux-saga/effects';
import { isFunction, isEmpty } from 'lodash';

const okFetch = (payload, action, message) => {
  const successPayload = {
    type: `${action}_SUCCESS`,
    payload,
    snackbar: {
      level: 'success',
      message: message,
    },
  };

  if (isEmpty(message)) delete successPayload.snackbar;

  return successPayload;
};

const errFetch = ({ code, message }, action) => ({
  type: `${action}_ERROR`,
  payload: { code, message },
  snackbar: {
    level: 'error',
    message,
  },
});

export default function* fetchAPIResult({
  apiResult,
  headers = {},
  payload,
  action,
  message = '',
  resultHandler = null,
  onSuccess,
  onError,
}) {
  try {
    const token = yield select(({ auth }) => auth.get('token'));
    const { result } = yield call(apiResult, {
      customHeaders: { Authorization: `Bearer ${token}`, ...headers },
      payload,
    });

    if (isFunction(resultHandler)) {
      return yield put(okFetch(resultHandler(result.data), action, message));
    }

    yield put(okFetch(result.data, action, message));
    if (onSuccess) onSuccess();
  } catch (error) {
    console.log("🚀 ~ error:", error)
    yield put(errFetch(error.data, action));
    if (onError) onError();
  }
}
