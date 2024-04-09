import types from '../constants/actionTypes';

export const getBankListAction = payload => ({
  type: types.GET_BANK_LIST,
  payload,
});

export const addBankAction = payload => ({
  type: types.ADD_BANK,
  payload,
});

export const editBankAction = payload => ({
  type: types.EDIT_BANK,
  payload,
});
