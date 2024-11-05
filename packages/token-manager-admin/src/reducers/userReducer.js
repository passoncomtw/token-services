import types from '~/constants/actionTypes';
import { PENDING_STATUS } from '~/constants/status.config';
import { fromJS } from 'immutable';
import { userState } from './initialState';
import { deleteListItem, updateList } from '~/utils/immutableUtils';
import { toDateTimeText } from '~/utils/dateUtils';

const COMPAER_KEY = 'id';
const LIST_KEY = {
  ACCOUNT: 'accountList',
  ORDER: 'orderList',
  PENDING: 'pendingList',
};

const getNowDateTime = () => toDateTimeText(new Date());

const setListByKey = (state, payload, key) =>
  state.merge(
    fromJS({ [LIST_KEY[key]]: payload.data, refreshAt: getNowDateTime() })
  );

const updateOrderListType = (state, payload, newValue) =>
  updateList(
    state,
    payload.transationId,
    newValue,
    COMPAER_KEY,
    LIST_KEY.ORDER
  );

const updatePendingListStatus = (state, payload, statusKey) =>
  updateList(
    state,
    payload.orderId,
    {
      status: PENDING_STATUS[statusKey],
    },
    COMPAER_KEY,
    LIST_KEY.PENDING
  );

const updateUserInfoSuccess = (state, statusKey) =>
  state.setIn(['userInfo', statusKey], 0);

const reducer = (user = userState, { type, payload }) => {
  switch (type) {
    case types.CANCEL_ORDER_SUCCESS:
      return updateOrderListType(user, payload, {
        orderType: 3,
        reason: payload.reason,
      });
    case types.COMPLETE_ORDER_SUCCESS:
      return updateOrderListType(user, payload, {
        orderType: 2,
      });
    case types.CANCEL_PENDING_ORDER_SUCCESS:
      return updatePendingListStatus(user, payload, 'CANCELED');
    case types.DELETE_PENDING_ORDER_SUCCESS:
      return deleteListItem(
        user,
        payload.orderId,
        COMPAER_KEY,
        LIST_KEY.PENDING
      );
    case types.DELETE_USER_ACCOUNT_SUCCESS:
      return deleteListItem(user, payload.id, COMPAER_KEY, LIST_KEY.ACCOUNT);
    case types.OPEN_PENDING_ORDER_SUCCESS:
      return updatePendingListStatus(user, payload, 'PROCESSING');
    case types.STOP_PENDING_ORDER_SUCCESS:
      return updatePendingListStatus(user, payload, 'PENDING');
    case types.UNLOCK_LOGIN_SUCCESS:
      return updateUserInfoSuccess(user, 'loginLock');
    case types.UNLOCK_TRANSACTION_SUCCESS:
      return updateUserInfoSuccess(user, 'transLock');
    case types.GET_USER_LIST_SUCCESS:
      return user.merge(fromJS(payload));
    case types.GET_USER_ORDER_LIST_SUCCESS:
      return setListByKey(user, payload, 'ORDER');
    case types.GET_USER_PENDING_ORDER_LIST_SUCCESS:
      return setListByKey(user, payload, 'PENDING');
    case types.GET_USER_ACCOUNT_LIST_BY_USER_ID_SUCCESS:
      return setListByKey(user, payload, 'ACCOUNT');
    case types.GET_USER_INFO_SUCCESS:
    case types.UPDATE_USER_INFO_SUCCESS:
      return user.update('userInfo', info => info.merge(fromJS(payload)));
    case types.UPDATE_USER_PWD_PWD_SUCCESS:
    case types.UPDATE_USER_PWD_PWD:
    case types.UPDATE_USER_PWD_ERRPR:
    case types.UPDATE_USER_TRANS_PWD_SUCCESS:
    case types.UPDATE_USER_TRANS_PWD:
    case types.UPDATE_USER_TRANS_PWD_ERRPR:
    case types.UPDATE_USER_INFO:
    case types.UPDATE_USER_INFO_ERROR:
    case types.GET_USER_INFO:
    case types.GET_USER_INFO_ERROR:
    case types.ADD_USER:
    case types.ADD_USER_ERROR:
    case types.ADD_USER_SUCCESS:
    case types.GET_USER_LIST:
    case types.GET_USER_LIST_ERROR:
    case types.UNLOCK_LOGIN:
    case types.UNLOCK_LOGIN_ERROR:
    case types.UNLOCK_TRANSACTION:
    case types.UNLOCK_TRANSACTION_ERROR:
    default:
      return user;
  }
};

export default reducer;
