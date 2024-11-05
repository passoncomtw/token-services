import types from '~/constants/actionTypes';
export const cancelOrderAction = payload => ({
  type: types.CANCEL_ORDER,
  payload,
});

export const completeOrderAction = payload => ({
  type: types.COMPLETE_ORDER,
  payload,
});

export const getOrderListAction = payload => ({
  type: types.GET_ORDER_LIST,
  payload,
});
