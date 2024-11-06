import types from '~/constants/actionTypes';

export const getBankAction = (payload) => ({
  type: types.GET_BANK_LIST,
  payload,
});
