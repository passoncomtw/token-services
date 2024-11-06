import types from '~/constants/actionTypes';
import { fromJS, updateIn } from 'immutable';
import { orderState } from './initialState';
import { parseOrderFormat } from '../utils/formatHelper';

const updateOrder = (orders, payload) => {
  const orderIndex = orders
    .get('list')
    .findIndex((order) => order.get('id') === payload.id);

  return updateIn(orders, ['list', orderIndex], () => fromJS(parseOrderFormat(payload)));
};

const addOrder = (orders, payload) => {
  return updateIn(orders, ['list'], (list) => list.insert(0, fromJS(payload)));
};

export default function reducer(orders = orderState, { type, payload }) {
  switch (type) {
    case types.LOGOUT_SUCCESS:
      return orderState;
    case types.GET_ORDERS_SUCCESS:
      return orders.merge(fromJS({ list: payload }));
    case types.ADD_ORDER_SUCCESS:
      return addOrder(orders, payload);
    case types.PAID_ORDER_SUCCESS:
    case types.CANCEL_ORDER_SUCCESS:
    case types.RELEASE_ORDER_SUCCESS:
      return updateOrder(orders, payload);
    case types.RELEASE_ORDER:
    case types.RELEASE_ORDER_ERROR:
    case types.PAID_ORDER:
    case types.PAID_ORDER_ERROR:
    case types.ADD_ORDER:
    case types.ADD_ORDER_ERROR:
    case types.GET_ORDERS:
    case types.GET_ORDERS_ERROR:
    case types.CANCEL_ORDER:
    case types.CANCEL_ORDER_ERROR:
    default:
      return orders;
  }
}
