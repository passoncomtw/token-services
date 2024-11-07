import types from '~/constants/actionTypes';
import fetchAPIResult from '~/helper/sagaHelper';
import {
  getUserInfoResult,
  updateUserInfoResult,
  updatePasswordResult,
} from '~/apis/api';

export function* getUserInfoSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getUserInfoResult,
    payload,
    action: types.GET_USER_INFO,
  });
}

export function* updateUserInfoSaga({ payload: { payload, onSuccess } }) {
  return yield fetchAPIResult({
    apiResult: updateUserInfoResult,
    payload,
    action: types.UPDATE_USER_INFO,
    onSuccess,
  });
}

export function* updatePasswordSaga({ payload: { payload, onSuccess } }) {
  return yield fetchAPIResult({
    payload,
    message: '修改成功',
    apiResult: updatePasswordResult,
    action: types.UPDATE_PASSWORD,
    onSuccess,
  });
}
