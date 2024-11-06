import types from '~/constants/actionTypes';
import { fromJS, updateIn } from 'immutable';
import { cardState } from './initialState';

const getCardIndex = (cards, payload) =>
  cards.get('cards').findIndex((item) => item.get('id') === payload.id);

const addCard = (cards, payload) => {
  return cards.update('cards', (list) => list.push(fromJS(payload)));
};

const updateCard = (cards, payload) => {
  const cardIndex = getCardIndex(cards, payload);
  return updateIn(cards, ['cards', cardIndex], (item) => fromJS(item));
};

export default function reducer(cards = cardState, { type, payload }) {
  switch (type) {
    case types.LOGOUT_SUCCESS:
      return cardState;
    case types.GET_CARD_LIST_SUCCESS:
      return cards.merge(fromJS(payload));
    case types.ADD_CARD_SUCCESS:
      return addCard(cards, payload);
    case types.UPDATE_CARD_SUCCESS:
      return updateCard(cards, payload);
    case types.DELETE_CARD_SUCCESS:
    case types.DELETE_CARD:
    case types.DELETE_CARD_ERROR:
    case types.UPDATE_CARD:
    case types.UPDATE_CARD_ERROR:
    case types.ADD_CARD:
    case types.ADD_CARD_ERROR:
    case types.GET_CARD_LIST:
    case types.GET_CARD_LIST_ERROR:
    default:
      return cards;
  }
}
