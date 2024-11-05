import types from '~/constants/actionTypes';

export const getUserAccountListAction = payload => ({
  type: types.GET_USER_ACCOUNT_LIST,
  payload,
});

export const deleteUserAccountAction = payload => ({
  type: types.DELETE_USER_ACCOUNT,
  payload,
});
