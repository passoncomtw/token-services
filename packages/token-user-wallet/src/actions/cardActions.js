import types from '~/constants/actionTypes';

export const getCardsAction = (payload) => ({
  type: types.GET_CARD_LIST,
  payload,
});

export const addCardAction = (payload) => ({
  type: types.ADD_CARD,
  payload,
});

export const updateCardAction = (payload) => ({
  type: types.UPDATE_CARD,
  payload,
});

export const deleteCardAction = (payload) => ({
  type: types.DELETE_CARD,
  payload,
});
