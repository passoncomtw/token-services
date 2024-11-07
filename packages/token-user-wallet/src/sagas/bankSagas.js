import types from '~/constants/actionTypes';
import fetchAPIResult from '~/helper/sagaHelper';
import { getBanksResult } from '~/apis/api';

export function* getBanksSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getBanksResult,
    payload,
    action: types.GET_BANK_LIST,
  });
}
