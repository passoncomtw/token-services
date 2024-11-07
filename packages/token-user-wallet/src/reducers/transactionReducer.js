import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';
import { transactionState } from './initialState';

export default function reducer(
  transactions = transactionState,
  { type, payload }
) {
  switch (type) {
    case types.LOGOUT_SUCCESS:
      return transactionState;
    case types.GET_BUYER_LIST_SUCCESS:
    case types.GET_SELLER_LIST_SUCCESS:
      return transactions.merge(fromJS(payload));
    case types.GET_BUYER_LIST:
    case types.GET_BUYER_LIST_ERROR:
    case types.GET_SELLER_LIST:
    case types.GET_SELLER_LIST_ERROR:
    default:
      return transactions;
  }
}
