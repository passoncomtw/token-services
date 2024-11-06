import types from "~/constants/actionTypes";
import fetchAPIResult from "~/helper/sagaHelper";
import {
  getCardsResult,
  addCardResult,
  updateCardResult,
  deleteCardResult,
} from "~/apis/api";

export function* getCardsSaga({ payload }) {
  return yield fetchAPIResult({
    action: types.GET_CARD_LIST,
    apiResult: getCardsResult,
    payload,
    resultHandler: (data) => {
      return {
        cards: data,
      };
    },
  });
}

export function* addCardSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    action: types.ADD_CARD,
    apiResult: addCardResult,
    payload,
    onSuccess,
  });
}

export function* updateCardSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    action: types.UPDATE_CARD,
    apiResult: updateCardResult,
    payload,
    onSuccess,
  });
}

export function* deleteCardSaga({ payload: { onSuccess, ...payload } }) {
  return yield fetchAPIResult({
    action: types.DELETE_CARD,
    apiResult: deleteCardResult,
    payload,
    onSuccess,
  });
}
