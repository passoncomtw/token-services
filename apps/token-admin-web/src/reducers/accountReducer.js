import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { accountState } from './initialState';
import { updateList, deleteListItem } from '~/utils/immutableUtils';

const addAccountSuccess = (account, payload) =>
  account
    .update('list', list => list.insert(0, fromJS(payload)))
    .update('total', total => fromJS(total + 1));

const reducer = (account = accountState, { type, payload }) => {
  switch (type) {
    case types.DELETE_ACCOUNT_SUCCESS:
      return deleteListItem(account, payload.accountId, 'accountId');
    case types.UPDATE_ACCOUNT_SUCCESS:
      return updateList(account, payload.accountId, payload, 'accountId');
    case types.GET_ACCOUNT_LIST_SUCCESS:
      return account.merge(fromJS(payload));
    case types.ADD_ACCOUNT_SUCCESS:
    case types.DELETE_ACCOUNT:
    case types.DELETE_ACCOUNT_ERROR:
    case types.UPDATE_ACCOUNT:
    case types.UPDATE_ACCOUNT_ERROR:
    case types.ADD_ACCOUNT:
    case types.ADD_ACCOUNT_ERROR:
    case types.GET_ACCOUNT_LIST:
    case types.GET_ACCOUNT_LIST_ERROR:
    default:
      return account;
  }
};

export default reducer;
