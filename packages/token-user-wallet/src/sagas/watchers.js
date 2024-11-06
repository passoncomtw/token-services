import types from '~/constants/actionTypes';
import { takeLatest } from 'redux-saga/effects';
import { getBanksSaga } from './bankSagas';
import { getOrdersSaga } from './orderSaga';
import { initialAppSaga } from './initialAppSaga';
import {
  getPendingOrderSaga,
  addPendingOrderSaga,
  lockPendingOrderSaga,
  startPendingOrderSaga,
  deletePendingOrderSaga,
  getPendingDetailSaga,
} from './pendingOrderSaga';
import { loginSaga, logoutSaga, registrySaga } from './authSagas';
import {
  getUserInfoSaga,
  updateUserInfoSaga,
  updatePasswordSaga,
} from './userSaga';
import {
  getCardsSaga,
  addCardSaga,
  updateCardSaga,
  deleteCardSaga,
} from './cardSaga';
import {
  addOrderSaga,
  getBuyersSaga,
  paidOrderSaga,
  getSellersSaga,
  cancelOrderSaga,
  releaseOrderSaga,
} from './transactionSaga';

export function* watchInitialAppSaga() {
  yield takeLatest(types.INITIAL_APP, initialAppSaga);
}

export function* watchLoginSaga() {
  yield takeLatest(types.LOGIN, loginSaga);
}

export function* watchLogoutSaga() {
  yield takeLatest(types.LOGOUT, logoutSaga);
}

export function* watchRegistrySaga() {
  yield takeLatest(types.REGISTRY, registrySaga);
}

export function* watchGetSellersSaga() {
  yield takeLatest(types.GET_SELLER_LIST, getSellersSaga);
}

export function* watchGetBuyerSaga() {
  yield takeLatest(types.GET_BUYER_LIST, getBuyersSaga);
}

export function* watchGetCardsSaga() {
  yield takeLatest(types.GET_CARD_LIST, getCardsSaga);
}

export function* watchAddCardSaga() {
  yield takeLatest(types.ADD_CARD, addCardSaga);
}

export function* watchUpdateCardSaga() {
  yield takeLatest(types.UPDATE_CARD, updateCardSaga);
}

export function* watchDeleteCardSaga() {
  yield takeLatest(types.DELETE_CARD, deleteCardSaga);
}

export function* watchGetPendingOrderSaga() {
  yield takeLatest(types.GET_PENDING_ORDER, getPendingOrderSaga);
}

export function* watchAddPendingOrderSaga() {
  yield takeLatest(types.ADD_PENDING_ORDER, addPendingOrderSaga);
}

export function* watchLockPendingOrderSaga() {
  yield takeLatest(types.LOCK_PENDING_ORDER, lockPendingOrderSaga);
}

export function* watchDeletePendingOrderSaga() {
  yield takeLatest(types.DELETE_PENDING_ORDER, deletePendingOrderSaga);
}

export function* watchGetPendingDetailSaga() {
  yield takeLatest(types.GET_PENDING_DETAIL, getPendingDetailSaga);
}

export function* watchStartPendingOrderSaga() {
  yield takeLatest(types.START_PENDING_ORDER, startPendingOrderSaga);
}

export function* watchAddOrderSaga() {
  yield takeLatest(types.ADD_ORDER, addOrderSaga);
}

export function* watchCancelOrderSaga() {
  yield takeLatest(types.CANCEL_ORDER, cancelOrderSaga);
}

export function* watchPaidOrderSaga() {
  yield takeLatest(types.PAID_ORDER, paidOrderSaga);
}

export function* watchReleaseOrderSaga() {
  yield takeLatest(types.RELEASE_ORDER, releaseOrderSaga);
}

export function* watchGetUserInfoSaga() {
  yield takeLatest(types.GET_USER_INFO, getUserInfoSaga);
}

export function* watchUpdateUserInfoSaga() {
  yield takeLatest(types.UPDATE_USER_INFO, updateUserInfoSaga);
}

export function* watchUpdatePasswordSaga() {
  yield takeLatest(types.UPDATE_PASSWORD, updatePasswordSaga);
}

export function* watchGetBanksSaga() {
  yield takeLatest(types.GET_BANK_LIST, getBanksSaga);
}

export function* watchGetOrdersSaga() {
  yield takeLatest(types.GET_ORDERS, getOrdersSaga);
}
