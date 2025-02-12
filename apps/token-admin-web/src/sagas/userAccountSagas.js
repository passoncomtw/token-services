import types from '~/constants/actionTypes';
import { put } from 'redux-saga/effects';
import fetchAPIResult from '~/utils/sagaUtils';
import {
  getBankCardListResult,
  // deleteBankCardResult,
} from '~/apis/api';
import { compactObject } from '~/utils/utils';

export function* getUserAccountListSaga({ payload }) {
  return yield fetchAPIResult({
    action: types.GET_USER_ACCOUNT_LIST,
    apiResult: getBankCardListResult,
    payload: compactObject(payload),
    resultHandler: ({ rows, count }) => ({ data: rows, count }),
  });
}

export function* deleteUserAccountSaga({ payload }) {
  yield put({
    type: types.DELETE_USER_ACCOUNT_SUCCESS,
    payload,
  });
  // return yield fetchAPIResult({
  //   apiResult: deleteBankCardResult,
  //   payload,
  //   action: types.DELETE_USER_ACCOUNT,
  //   message: '已刪除帳戶',
  // });
}
