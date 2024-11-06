import { select } from 'redux-saga/effects';
import types from '~/constants/actionTypes';
import fetchAPIResult from '~/helper/sagaHelper';
import { getOrderResult } from '~/apis/api';
import { parseOrderFormat } from '~/utils/formatHelper';

export function* getOrdersSaga({ payload }) {
  const userId = yield select(({ auth }) => auth.getIn(['user', 'id']));

  return yield fetchAPIResult({
    apiResult: getOrderResult,
    payload,
    action: types.GET_ORDERS,
    resultHandler: (data) => {
      return data.rows.map((order) => parseOrderFormat(order, userId));
    },
  });
}
