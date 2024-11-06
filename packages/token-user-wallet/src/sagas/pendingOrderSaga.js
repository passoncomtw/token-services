import types from '~/constants/actionTypes';
import fetchAPIResult from '~/helper/sagaHelper';
import {
  getPendingOrder,
  addPendingOrder,
  lockPendingOrder,
  unlockPendingOrder,
  deletePendingOrder,
  getPendingOrderDetail,
} from '~/apis/api';

export function* getPendingOrderSaga() {
  return yield fetchAPIResult({
    apiResult: getPendingOrder,
    payload: {},
    action: types.GET_PENDING_ORDER,
  });
}

export function* addPendingOrderSaga({ payload: {onSuccess, ...payload} }) {
  return yield fetchAPIResult({
    action: types.ADD_PENDING_ORDER,
    apiResult: addPendingOrder,
    payload,
    onSuccess,
  });
}

export function* lockPendingOrderSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: lockPendingOrder,
    payload,
    action: types.LOCK_PENDING_ORDER,
    resultHandler: () => payload,
  });
}

export function* deletePendingOrderSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: deletePendingOrder,
    payload,
    action: types.DELETE_PENDING_ORDER,
    resultHandler: () => payload,
  });
}

export function* startPendingOrderSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: unlockPendingOrder,
    payload,
    action: types.START_PENDING_ORDER,
    resultHandler: () => payload,
  });
}

export function* getPendingDetailSaga({ payload }) {
  return yield fetchAPIResult({
    apiResult: getPendingOrderDetail,
    payload,
    action: types.GET_PENDING_DETAIL,
  });
}
