import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { pendingOrderState } from './initialState';
import { PENDING_STATUS } from '~/constants/status.config';
import { getMatchedIndex, updateList } from '~/utils/immutableUtils';

const reducer = (pendingOrder = pendingOrderState, { type, payload }) => {
  switch (type) {
    case types.CANCEL_PENDING_ORDER_SUCCESS:
      return updateList(pendingOrder, payload.orderId, {
        status: PENDING_STATUS.CANCELED,
      });
    case types.DELETE_PENDING_ORDER_SUCCESS:
      return pendingOrder.removeIn([
        'list',
        getMatchedIndex(pendingOrder.get('list'), payload.orderId),
      ]);
    case types.OPEN_PENDING_ORDER_SUCCESS:
      return updateList(pendingOrder, payload.orderId, {
        status: PENDING_STATUS.PROCESSING,
      });
    case types.STOP_PENDING_ORDER_SUCCESS:
      return updateList(pendingOrder, payload.orderId, {
        status: PENDING_STATUS.PENDING,
      });
    case types.GET_PENDING_ORDER_LIST_SUCCESS:
      return pendingOrder.merge(fromJS({ list: payload.data }));
    case types.GET_PENDING_ORDER_LIST:
    case types.GET_PENDING_ORDER_LIST_ERROR:
    default:
      return pendingOrder;
  }
};

export default reducer;
