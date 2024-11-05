import types from '~/constants/actionTypes';

export const addUserAction = payload => ({
  type: types.ADD_USER,
  payload,
});

export const getUserListAction = payload => ({
  type: types.GET_USER_LIST,
  payload,
});

export const getUserOrderListAction = payload => ({
  type: types.GET_USER_ORDER_LIST,
  payload,
});

export const getUserPendingOrderListAction = payload => ({
  type: types.GET_USER_PENDING_ORDER_LIST,
  payload,
});

export const getUserAccountListByUserIdAction = payload => ({
  type: types.GET_USER_ACCOUNT_LIST_BY_USER_ID,
  payload,
});

export const getUserInfoAction = payload => ({
  type: types.GET_USER_INFO,
  payload,
});

export const updateUserInfoAction = payload => ({
  type: types.UPDATE_USER_INFO,
  payload,
});

export const updateUserPwdAction = payload => ({
  type: types.UPDATE_USER_PWD,
  payload,
});

export const updateUserTransactionPwdAction = payload => ({
  type: types.UPDATE_USER_TRANS_PWD,
  payload,
});

export const unlockLoginAction = payload => ({
  type: types.UNLOCK_LOGIN,
  payload,
});

export const unlockTransactionAction = payload => ({
  type: types.UNLOCK_TRANSACTION,
  payload,
});
