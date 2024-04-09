import types from '~/constants/actionTypes';

export const getUserInfoAction = (payload) => ({
  type: types.GET_USER_INFO,
  payload,
});

export const updateUserInfoAction = (payload) => ({
  type: types.UPDATE_USER_INFO,
  payload,
});

export const updatePasswordAction = (payload) => ({
  type: types.UPDATE_PASSWORD,
  payload,
});
