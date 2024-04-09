import types from '~/constants/actionTypes';
import { put } from 'redux-saga/effects';
import fetchAPIResult from '~/utils/sagaUtils';
import {
  getRoleListResult,
  // editRoleResult,
  deleteRoleResult,
  addRoleResult,
} from '~/apis/api';
import { records } from '~/constants/mock/role';

export function* getRoleListSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getRoleListResult,
    payload,
    action: types.GET_ROLE_LIST,
  });
}

export function* updateRoleSaga({ payload }) {
  yield put({
    type: types.UPDATE_ROLE_SUCCESS,
    payload,
  });
  // return yield fetchAPIResult({
  //   apiResult: editRoleResult,
  //   payload,
  //   action: types.UPDATE_ROLE,
  // });
}

export function* addRoleSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: addRoleResult,
    payload,
    action: types.ADD_ROLE,
  });
}

export function* deleteRoleSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: deleteRoleResult,
    payload,
    action: types.DELETE_ROLE,
    resultHandler: () => payload,
  });
}
