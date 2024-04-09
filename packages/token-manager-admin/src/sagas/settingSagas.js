import types from '~/constants/actionTypes';
import { put } from 'redux-saga/effects';
// import fetchAPIResult from '~/utils/sagaUtils';
// import {
//   getPermissionTreeResult,
// } from '~/apis/api';
import { allPermissions } from '~/constants/mock/allPermissions';

export function* getPermissionTreeSaga() {
  yield put({
    type: types.GET_PERMISSION_TREE_SUCCESS,
    payload: allPermissions,
  });
  // return yield fetchAPIResult({
  //   apiResult: getPermissionTreeResult,
  //   payload,
  //   action: types.GET_PERMISSION_TREE_SUCCESS,
  // });
}
