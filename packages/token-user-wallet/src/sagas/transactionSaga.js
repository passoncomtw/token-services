import { select } from 'redux-saga/effects';
import types from '~/constants/actionTypes';
import fetchAPIResult from '~/helper/sagaHelper';
import { parseOrderFormat } from '~/utils/formatHelper';
import {
  getTransactionResult,
  addOrderResult,
  orderCancelResult,
  orderReleaseResult,
  orderPaidResult,
} from '~/apis/api';
import { ORDER_TYPE } from '~/constants/status.config';

export function* getSellersSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getTransactionResult,
    payload: { type: ORDER_TYPE.SALE },
    action: types.GET_SELLER_LIST,
    resultHandler: (data) => {
      return {
        total: data.count,
        sellerList: data.rows,
      };
    },
  });
}

export function* getBuyersSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getTransactionResult,
    payload: { type: ORDER_TYPE.BUY },
    action: types.GET_BUYER_LIST,
    resultHandler: (data) => {
      return {
        total: data.count,
        buyerList: data.rows,
      };
    },
  });
}
export function* addOrderSaga({ payload }) {
  const { componentId, ...submitPayload } = payload;
  const userId = yield select(({ auth }) => auth.getIn(['user', 'id']));

  return yield fetchAPIResult({
    apiResult: addOrderResult,
    payload: submitPayload,
    action: types.ADD_ORDER,
    resultHandler: (data) => {
      return parseOrderFormat(data, userId);
    },
    onSuccess: (data) => {
      return data;
    },
  });
}

export function* cancelOrderSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: orderCancelResult,
    payload,
    action: types.CANCEL_ORDER,
  });
}

export function* releaseOrderSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    action: types.RELEASE_ORDER,
    apiResult: orderReleaseResult,
    payload,
    onSuccess,
    resultHandler: (data) => {
      return parseOrderFormat(data, userId);
    },
  });
}

export function* paidOrderSaga({ payload: { onSuccess, ...payload } }) {
  const userId = yield select(({ auth }) => auth.getIn(['user', 'id']))

  return yield fetchAPIResult({
    apiResult: orderPaidResult,
    payload,
    action: types.PAID_ORDER,
    onSuccess,
    resultHandler: (data) => {
      return parseOrderFormat(data, userId);
    },
  });
}
