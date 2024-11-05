import types from '~/constants/actionTypes';

export const getRoleListAction = payload => ({
  type: types.GET_ROLE_LIST,
  payload,
});

export const addRoleAction = payload => ({
  type: types.ADD_ROLE,
  payload,
});

export const updateRoleAction = payload => ({
  type: types.UPDATE_ROLE,
  payload,
});

export const deleteRoleAction = payload => ({
  type: types.DELETE_ROLE,
  payload,
});
