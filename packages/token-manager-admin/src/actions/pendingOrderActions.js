import types from '~/constants/actionTypes';
export const cancelPendingOrderAction = payload => ({
  type: types.CANCEL_PENDING_ORDER,
  payload,
});

export const deletePendingOrderAction = payload => ({
  type: types.DELETE_PENDING_ORDER,
  payload,
});

export const openPendingOrderAction = payload => ({
  type: types.OPEN_PENDING_ORDER,
  payload,
});

export const stopPendingOrderAction = payload => ({
  type: types.STOP_PENDING_ORDER,
  payload,
});

export const getPendingOrderListAction = payload => ({
  type: types.GET_PENDING_ORDER_LIST,
  payload,
});
