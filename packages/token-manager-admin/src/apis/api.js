import {
  fetchPost,
  fetchGetWithToken,
  fetchPostWithToken,
  fetchGet,
} from './libs/fetch';

const fetchDeleteWithToken = (url, customHeaders, payload = {}) =>
  fetchPostWithToken(url, customHeaders, payload, 'DELETE');

const fetchPutWithToken = (url, customHeaders, payload = {}) =>
  fetchPostWithToken(url, customHeaders, payload, 'PUT');

// 使用者驗證
export const loginResult = ({ payload }) => fetchPost('auth/login', payload);

export const logoutResult = ({ customHeaders }) =>
  fetchPostWithToken('auth/logout', customHeaders);

// TODO_CHECK：Swagger is not defined
export const editPasswordResult = ({ customHeaders }) =>
  fetchPostWithToken('auth/password', customHeaders);

// 後台角色
export const addRoleResult = ({ customHeaders, payload }) =>
  fetchPostWithToken('backendactors', customHeaders, payload);

export const deleteRoleResult = ({ customHeaders, payload }) =>
  fetchDeleteWithToken(`backendactors/${payload.roleId}`, customHeaders);

export const editRoleResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`backendactors/${payload.roleId}`, customHeaders, payload);

// TODO_CHECK：Swagger is not defined
export const getRoleListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken('backendactors', customHeaders, payload);

// TODO_CHECK：Swagger is not defined
export const getPermissionTreeResult = ({ customHeaders }) =>
  fetchGetWithToken('permissions', customHeaders);

// 後台使用者
export const addBEUserResult = ({ customHeaders, payload }) =>
  fetchPostWithToken('backendusers', customHeaders, payload);

export const deleteBEUserResult = ({ customHeaders, payload }) =>
  fetchDeleteWithToken(`backendusers/${payload.userId}`, customHeaders);

export const editBEUserResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`backendusers/${payload.userId}`, customHeaders, payload);

export const getBEUserListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken('backendusers', customHeaders, payload);

// 銀行卡
export const getBankCardListByBankIdResult = ({ customHeaders, payload }) =>
  fetchGetWithToken(`bankcards/${payload.bankId}`, customHeaders, payload);

export const getBankCardListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken('bankcards', customHeaders, payload);

// 檢查服務狀態
export const getServiceStatusResult = () => fetchGet('health-check');

// 訂單
export const cancelOrderResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`orders/${payload.transactionId}/cancel`, customHeaders);

export const completeOrderResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`orders/${payload.transactionId}/complete`, customHeaders);

export const getOrderListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken('orders', customHeaders, payload);

// 掛單
export const deletePendingOrderResult = ({ customHeaders, payload }) =>
  fetchDeleteWithToken(`pending/orders/${payload.orderId}`, customHeaders);

export const openPendingOrderResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`pending/orders/${payload.orderId}/open`, customHeaders);

export const cancelPendingOrderResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`pending/orders/${payload.orderId}/cancel`, customHeaders);

export const stopPendingOrderResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`pending/orders/${payload.orderId}/stop`, customHeaders);

export const getPendingOrderListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken('pending/orders', customHeaders, payload);

// 使用者
export const addUserResult = ({ customHeaders, payload }) =>
  fetchPostWithToken('users', customHeaders, payload);

export const editUserTransPasswordResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(
    `users/${payload.userId}/transaction/password`,
    customHeaders,
    payload
  );

export const editUserLoginPasswordResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(
    `users/${payload.userId}/login/password`,
    customHeaders,
    payload
  );

// TODO_CHECK swagger: `/users/detail` ?
export const getUserInfoResult = ({ customHeaders, payload }) =>
  fetchGetWithToken(`users/${payload.userId}`, customHeaders);

export const getUserBankCardListResult = ({
  customHeaders,
  payload: { userId, ...query },
}) => fetchGetWithToken(`users/${userId}/bankcards`, customHeaders, query);

export const getUserPendingOrderListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken(`users/${payload.userId}/pending/orders`, customHeaders);

export const getUserOrderListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken(`users/${payload.userId}/orders`, customHeaders);

export const getUserListResult = ({ customHeaders, payload }) =>
  fetchGetWithToken('users', customHeaders, payload);

export const unlockUserResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`users/${payload.userId}/unlock`, customHeaders);

// 銀行

export const getBanksResult = ({ customHeaders }) =>
  fetchGetWithToken('banks', customHeaders);

export const addBankResult = ({ customHeaders, payload }) =>
  fetchPostWithToken('banks', customHeaders, payload);

export const updateBankResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`banks/${payload.id}`, customHeaders, payload);
