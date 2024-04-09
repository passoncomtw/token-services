import { fromJS, updateIn } from 'immutable';
import types from '~/constants/actionTypes';
import { bankState } from './initialState';

const addBankSuccess = (banks, payload) => {
  return updateIn(banks, ['list'], list => list.insert(0, fromJS(payload)));
};

const editBankSuccess = (banks, payload) => {
  const index = banks
    .get('list')
    .findIndex(bank => bank.get('id') === payload.id);

  return updateIn(banks, ['list', index], () => fromJS(payload));
};

const reducer = (banks = bankState, { type, payload }) => {
  switch (type) {
    case types.GET_BANK_LIST_SUCCESS:
      return banks.merge(fromJS(payload));
    case types.ADD_BANK_SUCCESS:
      return addBankSuccess(banks, payload);
    case types.EDIT_BANK_SUCCESS:
      return editBankSuccess(banks, payload);
    case types.EDIT_BANK:
    case types.EDIT_BANK_ERROR:
    case types.ADD_BANK:
    case types.ADD_BANK_ERROR:
    case types.GET_BANK_LIST:
    case types.GET_BANK_LIST_ERROR:
    default:
      return banks;
  }
};

export default reducer;
