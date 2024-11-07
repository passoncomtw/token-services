import types from '~/constants/actionTypes';

export const getSellerListAction = (payload) => ({
  type: types.GET_SELLER_LIST,
  payload,
});

export const getBuyerListAction = (payload) => ({
  type: types.GET_BUYER_LIST,
  payload,
});

export const addOrderAction = (payload) => ({
  type: types.ADD_ORDER,
  payload,
});

export const cancelOrderAction = (payload) => ({
  type: types.CANCEL_ORDER,
  payload,
});

export const paidOrderAction = (payload) => ({
  type: types.PAID_ORDER,
  payload,
});

export const releaseOrderAction = (payload) => ({
  type: types.RELEASE_ORDER,
  payload,
});
