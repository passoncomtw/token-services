import types from '~/constants/actionTypes';
import { put } from 'redux-saga/effects';
import fetchAPIResult from '~/utils/sagaUtils';
import {
  getBEUserListResult,
  editBEUserResult,
  // deleteBEUserResult,
  addBEUserResult,
} from '~/apis/api';
import { compactObject } from '~/utils/utils';

export function* getAccountListSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getBEUserListResult,
    payload: compactObject(payload),
    action: types.GET_ACCOUNT_LIST,
  });
}

export function* updateAccountSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    apiResult: editBEUserResult,
    payload,
    action: types.UPDATE_ACCOUNT,
    onSuccess,
  });
}

export function* addAccountSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    apiResult: addBEUserResult,
    action: types.ADD_ACCOUNT,
    payload,
    onSuccess,
  });
}

export function* deleteAccountSaga({ payload }) {
  yield put({
    type: types.DELETE_ACCOUNT_SUCCESS,
    payload,
  });
  // return yield fetchAPIResult({
  //   apiResult: deleteBEUserResult,
  //   payload,
  //   action: types.DELETE_ACCOUNT,
  // });
}
