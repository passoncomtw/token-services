import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { roleState } from './initialState';
import { updateList, deleteListItem } from '~/utils/immutableUtils';

const addRoleSuccess = (role, payload) =>
  role
    .update('rows', list => list.insert(0, fromJS(payload)))
    .update('count', count => fromJS(count + 1));

const reducer = (role = roleState, { type, payload }) => {
  switch (type) {
    case types.DELETE_ROLE_SUCCESS:
      const matchedIndex = role.get('rows').findIndex(item => {
        return item.get('id') === payload.roleId;
      });
      return role
        .removeIn(['rows', matchedIndex])
        .update('count', count => fromJS(count - 1));
    case types.UPDATE_ROLE_SUCCESS:
      return updateList(role, payload.roleId, payload, 'roleId');
    case types.ADD_ROLE_SUCCESS:
      return addRoleSuccess(role, payload);
    case types.GET_ROLE_LIST_SUCCESS:
      return role.merge(fromJS(payload));
    case types.DELETE_ROLE:
    case types.DELETE_ROLE_ERROR:
    case types.UPDATE_ROLE:
    case types.UPDATE_ROLE_ERROR:
    case types.ADD_ROLE:
    case types.ADD_ROLE_ERROR:
    case types.GET_ROLE_LIST:
    case types.GET_ROLE_LIST_ERROR:
    default:
      return role;
  }
};

export default reducer;
