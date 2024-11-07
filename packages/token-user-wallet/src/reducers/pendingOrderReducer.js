import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { pendingOrderState } from './initialState';
import { PENDING_STATUS } from '~/constants/status.config';

const PENDING_TYPE = ['buy', 'sell'];

const lockPendingSuccess = (pendingOrder, { type }) =>
  pendingOrder.update(PENDING_TYPE[type], (pending) =>
    pending.update('status', () => fromJS(PENDING_STATUS.PENDING))
  );

const startPendingSuccess = (pendingOrder, { type }) =>
  pendingOrder.update(PENDING_TYPE[type], (pending) =>
    pending.update('status', () => fromJS(PENDING_STATUS.PROCESSING))
  );

const deletePendingSuccess = (pendingOrder, { type }) =>
  pendingOrder.update(PENDING_TYPE[type], () => fromJS({}));

const addPendingSuccess = (pendingOder, payload) => {
  const updateType = payload.type === 0 ? 'buy' : 'sell';
  const defaultCount = {
    doneCount: 0,
    doneAmount: 0,
    cancelCount: 0,
    cancelAmount: 0,
    processCount: 0,
    processAmount: 0,
  };
  return pendingOder.update(updateType, () =>
    fromJS({ ...payload, ...defaultCount })
  );
};

export default function reducer(
  pendingOrder = pendingOrderState,
  { type, payload }
) {
  switch (type) {
    case types.LOGOUT_SUCCESS:
      return pendingOrderState;
    case types.GET_PENDING_ORDER_SUCCESS:
      return pendingOrder.merge(fromJS(payload));
    case types.LOCK_PENDING_ORDER_SUCCESS:
      return lockPendingSuccess(pendingOrder, payload);
    case types.DELETE_PENDING_ORDER_SUCCESS:
      return deletePendingSuccess(pendingOrder, payload);
    case types.START_PENDING_ORDER_SUCCESS:
      return startPendingSuccess(pendingOrder, payload);
    case types.ADD_PENDING_ORDER_SUCCESS:
      return addPendingSuccess(pendingOrder, payload);
    case types.START_PENDING_ORDER_ERROR:
    case types.START_PENDING_ORDER:
    case types.DELETE_PENDING_ORDER_ERROR:
    case types.DELETE_PENDING_ORDER:
    case types.LOCK_PENDING_ORDER_ERROR:
    case types.LOCK_PENDING_ORDER:
    case types.GET_PENDING_ORDER_ERROR:
    case types.GET_PENDING_ORDER:
    case types.ADD_PENDING_ORDER_ERROR:
    case types.ADD_PENDING_ORDER:
    default:
      return pendingOrder;
  }
}
