import { put, select, call } from 'redux-saga/effects';
import types from '~/constants/actionTypes';
import { loginResult, logoutResult, registryResult } from '~/apis/api';
import {
  saveUserInformation,
  removeUserInformation,
} from '~/store/asyncStorageManager';

const okLogin = (data) => {
  const payload = {
    ...data,
    isAuth: true,
    dialog: {
      type: 'success',
      message: "登入成功",
    },
  };

  saveUserInformation(payload);
  return {
    type: types.LOGIN_SUCCESS,
    payload,
  };
};

const errLogin = ({ message }) => {
  return {
    type: types.LOGIN_ERROR,
    dialog: {
      message,
      action: () => false,
    },
  };
};

export function* loginSaga({ payload }) {
  try {
    const { result } = yield call(loginResult, payload);

    yield put(okLogin(result.data));
  } catch (error) {
    const errorAction = errLogin(error);
    yield put(errorAction);
  }
}

const okLogout = () => {
  removeUserInformation();
  // noAuthNavigator();
  return {
    type: types.LOGOUT_SUCCESS,
  };
};

const errLogout = ({ message }) => {
  return {
    type: types.LOGOUT_ERROR,
    dialog: {
      type: 'error',
      message,
    },
  };
};

export function* logoutSaga() {
  try {
    const token = yield select(({ auth }) => auth.get('token'));

    yield call(logoutResult, {
      customHeaders: { Authorization: `Bearer ${token}` },
    });
    yield put(okLogout());
  } catch (error) {
    const errorAction = errLogout(error);
    yield put(errorAction);
  }
}

const okRegistry = (dialog) => {
  return {
    type: types.REGISTRY_SUCCESS,
    dialog,
  };
};

const errRegistry = ({ message }) => {
  return {
    type: types.REGISTRY_ERROR,
    dialog: { message },
  };
};

export function* registrySaga({ payload: { dialog, onSuccess, ...payload } }) {
  try {
    yield call(registryResult, payload);
    onSuccess();
    yield put(okRegistry(dialog));
  } catch (error) {
    const errorAction = errRegistry(error);
    yield put(errorAction);
  }
}
