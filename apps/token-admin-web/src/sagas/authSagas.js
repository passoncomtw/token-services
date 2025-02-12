import { put } from 'redux-saga/effects';
import types from '~/constants/actionTypes';
import { loginResult, logoutResult, editPasswordResult } from '~/apis/api';
import fetchAPIResult from '~/utils/sagaUtils';

export function* loginSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: loginResult,
    action: types.LOGIN,
    payload,
  });
}

export function* logoutSaga() {
  yield put({
    type: types.LOGOUT_SUCCESS,
  });
  // TODO_REMOVE：LOGOUT API IS 404
  // return yield fetchAPIResult({
  //   apiResult: logoutResult,
  //   action: types.LOGOUT,
  // });
}

export function* editPasswordSaga() {
  yield put({
    type: types.EDIT_PASSWORD_SUCCESS,
  });
  // TODO_REMOVE：EDIT_PASSWORD API IS undefined
  // return yield fetchAPIResult({
  //   apiResult: editPasswordResult,
  //   action: types.EDIT_PASSWORD,
  //   message: '修改成功',
  // });
}
