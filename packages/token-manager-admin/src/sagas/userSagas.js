import types from '~/constants/actionTypes';
import { put } from 'redux-saga/effects';
import fetchAPIResult from '~/utils/sagaUtils';
import {
  addUserResult,
  getUserInfoResult,
  //   updateUserInfoResult,
  getUserListResult,
  getUserOrderListResult,
  getUserPendingOrderListResult,
  getUserBankCardListResult,
  // editUserLoginPasswordResult,
  // editUserTransPasswordResult,
  // unlockUserResult,
} from '~/apis/api';
import { pureList as userOrder } from '~/constants/mock/userOrder';
import { pureList as userPending } from '~/constants/mock/userPending';
import { pureList as userAccount } from '~/constants/mock/userAccount';
import { pureList as userInfo } from '~/constants/mock/userDetails';
import { compactObject } from '~/utils/utils';

export function* addUserSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    apiResult: addUserResult,
    payload,
    action: types.ADD_USER,
    onSuccess,
  });
}

export function* getUserListSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getUserListResult,
    payload: compactObject(payload),
    action: types.GET_USER_LIST,
  });
}

export function* getUserOrderListSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getUserOrderListResult,
    payload: compactObject(payload),
    action: types.GET_USER_ORDER_LIST,
    resultHandler: items => ({ data: items }),
  });
}

export function* getUserPendingOrderListSaga({ payload }) {
  return yield fetchAPIResult({
    action: types.GET_USER_PENDING_ORDER_LIST,
    apiResult: getUserPendingOrderListResult,
    payload,
    resultHandler: ({ rows, count }) => ({ data: rows, count }),
  });
}

export function* getUserAccountListByUserIdSaga({ payload }) {
  return yield fetchAPIResult({
    action: types.GET_USER_ACCOUNT_LIST_BY_USER_ID,
    apiResult: getUserBankCardListResult,
    payload,
    resultHandler: ({ rows, count }) => ({ data: rows, count }),
  });
}

export function* getUserInfoSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getUserInfoResult,
    payload,
    action: types.GET_USER_INFO,
    resultHandler: response => {
      return response;
    },
  });
}

export function* updateUserInfoSaga({ payload }) {
  yield put({
    type: types.UPDATE_USER_INFO_SUCCESS,
    payload,
  });
  // return yield fetchAPIResult({
  //   apiResult: updateUserInfoResult, //api url not ready!
  //   payload,
  //   action: types.UPDATE_USER_INFO,
  // });
}

export function* updateUserPwdSaga({ payload }) {
  yield put({
    type: types.UPDATE_USER_PWD_SUCCESS,
    payload,
  });
  // return yield fetchAPIResult({
  //   apiResult: editUserLoginPasswordResult,
  //   payload,
  //   action: types.UPDATE_USER_PWD,
  // });
}

export function* updateUserTransPwdSaga({ payload }) {
  yield put({
    type: types.UPDATE_USER_TRANS_PWD_SUCCESS,
    payload,
  });
  // return yield fetchAPIResult({
  //   apiResult: editUserTransPasswordResult,
  //   payload,
  //   action: types.UPDATE_USER_TRANS_PWD,
  // });
}

export function* unlockLoginSaga({ payload }) {
  yield put({
    type: types.UNLOCK_LOGIN_SUCCESS,
  });
  // return yield fetchAPIResult({
  //   apiResult: unlockUserResult,// api not ready, url will change
  //   payload,
  //   action: types.UNLOCK_LOGIN,
  // });
}

export function* unlockTransactionSaga({ payload }) {
  yield put({
    type: types.UNLOCK_TRANSACTION_SUCCESS,
  });
  // return yield fetchAPIResult({
  //   apiResult: unlockUserResult,// api not ready, url will change
  //   payload,
  //   action: types.UNLOCK_TRANSACTION,
  // });
}
