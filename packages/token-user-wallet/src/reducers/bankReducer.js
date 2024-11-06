import types from '~/constants/actionTypes';
import { bankState } from './initialState';
import { fromJS } from 'immutable';

export default function reducer(banks = bankState, { type, payload }) {
  switch (type) {
    case types.LOGOUT_SUCCESS:
      return bankState;
    case types.GET_BANK_LIST_SUCCESS:
      return banks.merge(fromJS({ list: payload }));
    case types.GET_BANK_LIST:
    case types.GET_BANK_LIST_ERROR:
    default:
      return banks;
  }
}
