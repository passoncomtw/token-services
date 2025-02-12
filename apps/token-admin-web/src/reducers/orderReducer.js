import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { orderState } from './initialState';
import { updateList } from '~/utils/immutableUtils';

const reducer = (order = orderState, { type, payload }) => {
  switch (type) {
    case types.CANCEL_ORDER_SUCCESS:
      return updateList(order, payload.transationId, {
        orderType: 3,
        reason: payload.reason,
      });
    case types.COMPLETE_ORDER_SUCCESS:
      return updateList(order, payload.transationId, {
        orderType: 2,
      });
    case types.GET_ORDER_LIST_SUCCESS:
      return order.merge(fromJS({ list: payload.data }));
    case types.GET_ORDER_LIST:
    case types.GET_ORDER_LIST_ERROR:
    default:
      return order;
  }
};

export default reducer;
