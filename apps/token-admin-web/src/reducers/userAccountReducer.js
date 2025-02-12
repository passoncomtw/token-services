import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { userAccountState } from './initialState';
import { deleteListItem } from '~/utils/immutableUtils';

const reducer = (userAccounts = userAccountState, { type, payload }) => {
  switch (type) {
    case types.DELETE_USER_ACCOUNT_SUCCESS:
      return deleteListItem(userAccounts, payload.id);
    case types.GET_USER_ACCOUNT_LIST_SUCCESS:
      return userAccounts.merge(fromJS(payload));
    case types.GET_USER_ACCOUNT_LIST:
    case types.GET_USER_ACCOUNT_LIST_ERROR:
    default:
      return userAccounts;
  }
};

export default reducer;
