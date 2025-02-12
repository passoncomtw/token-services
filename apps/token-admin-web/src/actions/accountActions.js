import types from '~/constants/actionTypes';

export const getAccountListAction = payload => ({
  type: types.GET_ACCOUNT_LIST,
  payload,
});

export const addAccountAction = payload => ({
  type: types.ADD_ACCOUNT,
  payload,
});

export const updateAccountAction = payload => ({
  type: types.UPDATE_ACCOUNT,
  payload,
});

export const deleteAccountAction = payload => ({
  type: types.DELETE_ACCOUNT,
  payload,
});
