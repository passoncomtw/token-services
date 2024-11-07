import types from '~/constants/actionTypes';

export const getPendingOrderAction = () => ({
  type: types.GET_PENDING_ORDER,
});

export const addPendingOrderAction = (payload) => ({
  type: types.ADD_PENDING_ORDER,
  payload,
});

export const lockPendingOrderAction = (payload) => ({
  type: types.LOCK_PENDING_ORDER,
  payload,
});

export const deletePendingOrderAction = (payload) => ({
  type: types.DELETE_PENDING_ORDER,
  payload,
});

export const startPendingOrderAction = (payload) => ({
  type: types.START_PENDING_ORDER,
  payload,
});

export const getPendingDetailAction = (payload) => ({
  type: types.GET_PENDING_DETAIL,
  payload,
});
