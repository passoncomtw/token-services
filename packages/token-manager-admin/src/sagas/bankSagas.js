import types from '~/constants/actionTypes';
import { getBanksResult, addBankResult, updateBankResult } from '~/apis/api';
import fetchAPIResult from '~/utils/sagaUtils';

export function* getBankListSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getBanksResult,
    action: types.GET_BANK_LIST,
    payload,
    resultHandler: banks => ({ list: banks }),
  });
}

export function* editBankSaga({ payload }) {
  // yield put({
  //   type: types.EDIT_BANK_SUCCESS,
  //   payload,
  // });
  return yield fetchAPIResult({
    apiResult: updateBankResult,
    action: types.EDIT_BANK,
    payload,
    resultHandler: () => payload,
  });
}

export function* addBankSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: addBankResult,
    action: types.ADD_BANK,
    payload,
    resultHandler: () => payload,
  });
}
