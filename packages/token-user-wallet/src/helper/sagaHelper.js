import { put, select, call } from 'redux-saga/effects';
import { isFunction, isEmpty } from 'lodash';

const okFetch = (payload, action, message) => {
  const successPayload = {
    type: `${action}_SUCCESS`,
    payload,
  };

  if (!isEmpty(message)) {
    successPayload.dialog = {
      type: 'success',
      message: message,
    }
  }

  return successPayload;
};

const errFetch = ({ code, message }, action) => ({
  type: `${action}_ERROR`,
  payload: { code, message },
  type: 'error',
  dialog: { message },
});

export default function* fetchAPIResult({
  apiResult,
  headers = {},
  payload,
  action,
  message = '',
  resultHandler = null,
  onSuccess = null,
  onError = null,
}) {
  try {
    const token = yield select(({ auth }) => auth.get('token'));

    const { result } = yield call(apiResult, {
      customHeaders: { Authorization: `Bearer ${token}`, ...headers },
      payload,
    });

    const nextPayload = isFunction(resultHandler)
      ? resultHandler(result.data)
      : result.data;

    if (isFunction(onSuccess)) onSuccess(nextPayload);
    yield put(okFetch(nextPayload, action, message));
  } catch (error) {
    if (isFunction(onError)) onError(error);
    yield put(errFetch(error, action));
  }
}
