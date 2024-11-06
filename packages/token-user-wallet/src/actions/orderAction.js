import types from '~/constants/actionTypes';

export const getOrdersAction = (payload) => ({
  type: types.GET_ORDERS,
  payload,
});
