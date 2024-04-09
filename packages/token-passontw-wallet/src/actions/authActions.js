import types from '~/constants/actionTypes';

export const loginAction = (payload) => ({
  type: types.LOGIN,
  payload,
});

export const logoutAction = () => ({
  type: types.LOGOUT,
});

export const registryAction = (payload) => ({
  type: types.REGISTRY,
  payload,
});
