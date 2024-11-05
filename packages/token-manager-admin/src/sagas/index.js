import { fork, all, takeLatest } from 'redux-saga/effects';
import { basicAsyncActionTypes } from '~/constants/actionTypes';
import types from '~/constants/actionTypes';
import { toCamelStyle } from '~/utils/format';

import * as Watchers from './watcher';
import * as authSagas from './authSagas';
import * as bankSagas from './bankSagas';
import * as userAccountSagas from './userAccountSagas';
import * as orderSagas from './orderSagas';
import * as pendingOrderSagas from './pendingOrderSagas';
import * as userSagas from './userSagas';
import * as roleSagas from './roleSagas';
import * as accountSagas from './accountSagas';
import * as settingSagas from './settingSagas';

const allSaga = {
  ...authSagas,
  ...bankSagas,
  ...orderSagas,
  ...pendingOrderSagas,
  ...userSagas,
  ...userAccountSagas,
  ...roleSagas,
  ...accountSagas,
  ...settingSagas,
};

const getMatchedSaga = actionType => {
  const camelActionType = toCamelStyle(actionType);
  const matchedSaga = allSaga[`${camelActionType}Saga`];
  return matchedSaga || null;
};

export default function* startForman() {
  let sagas = [];
  // for auto generate
  basicAsyncActionTypes.forEach(actionType => {
    const currentSaga = getMatchedSaga(actionType);
    if (!currentSaga) {
      console.error(`NOT DEFINED SAGA FOR: ${actionType}`);
      return;
    }

    const generatingFunction = function* () {
      yield takeLatest(types[actionType], currentSaga);
    };
    sagas.push(fork(generatingFunction));
  });

  // for customize saga
  for (let key in Watchers) {
    sagas.push(fork(Watchers[key]));
  }
  yield all(sagas);
}
