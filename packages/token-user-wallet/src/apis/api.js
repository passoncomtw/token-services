import {
  // fetchGet,
  fetchPost,
  fetchGetWithToken,
  fetchPostWithToken,
  fetchPutWithToken,
  // fetchPostFormDataWithToken,
} from "./libs/fetch";

export const refreshTokenResult = ({ customHeaders }) =>
  fetchGetWithToken("auth/refresh", customHeaders);

export const registryResult = ({ payload }) => fetchPost("users", payload);

export const loginResult = (payload) => fetchPost("auth/login", payload);

export const logoutResult = ({ customHeaders }) =>
  fetchPostWithToken("auth/logout", customHeaders);

export const getTransactionResult = ({ customHeaders, payload }) =>
  fetchGetWithToken("pending/orders", customHeaders, payload);

export const addOrderResult = ({ customHeaders, payload }) =>
  fetchPostWithToken("orders", customHeaders, payload);

export const orderPaidResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`orders/${payload.orderId}/paid`, customHeaders, {});

export const orderReleaseResult = ({ customHeaders, payload }) =>
  fetchPutWithToken(`orders/${payload.orderId}/apply`, customHeaders, {});

export const orderCancelResult = ({
  customHeaders,
  payload: { orderId, ...payload },
}) => fetchPutWithToken(`orders/${orderId}/reject`, customHeaders, payload);

export const getCardsResult = ({ customHeaders, payload }) =>
  fetchGetWithToken("bankcards", customHeaders, payload);

export const addCardResult = ({ customHeaders, payload }) =>
  fetchPostWithToken("bankcards", customHeaders, payload);

export const updateCardResult = ({ customHeaders, payload }) =>
  fetchPostWithToken(
    `bankcards/${payload.id}`,
    customHeaders,
    payload,
    {},
    "PUT"
  );

export const deleteCardResult = ({ customHeaders, payload }) =>
  fetchPostWithToken(
    `bankcards/${payload.id}`,
    customHeaders,
    {},
    {},
    "DELETE"
  );

export const getPendingOrder = ({ customHeaders, payload }) =>
  fetchGetWithToken("users/pending/orders", customHeaders, payload);

export const getPendingOrderDetail = ({ customHeaders, payload }) =>
  fetchGetWithToken(`pending/orders/${payload.id}`, customHeaders);

export const addPendingOrder = ({ customHeaders, payload }) =>
  fetchPostWithToken("pending/orders", customHeaders, payload);

export const lockPendingOrder = ({ customHeaders, payload }) =>
  fetchPutWithToken(`pending/orders/${payload.id}/lock`, customHeaders);

export const unlockPendingOrder = ({ customHeaders, payload }) =>
  fetchPutWithToken(`pending/orders/${payload.id}/unlock`, customHeaders);

export const deletePendingOrder = ({ customHeaders, payload }) =>
  fetchPostWithToken(
    `pending/orders/${payload.id}`,
    customHeaders,
    {},
    {},
    "DELETE"
  );

export const getUserInfoResult = ({ customHeaders, payload }) =>
  fetchGetWithToken(`users/${payload}`, customHeaders, {});

export const updateUserInfoResult = ({
  customHeaders,
  payload: { userId, ...payload },
}) => fetchPostWithToken(`users/${userId}`, customHeaders, payload, {}, "PUT");

export const updatePasswordResult = ({
  customHeaders,
  payload: { type, ...payload },
}) =>
  fetchPostWithToken(
    `users/${type}/password`,
    customHeaders,
    payload,
    {},
    "PUT"
  );

export const getBanksResult = ({ customHeaders, payload }) =>
  fetchGetWithToken("banks", customHeaders, payload);

export const getOrderResult = ({ customHeaders, payload }) =>
  fetchGetWithToken("orders", customHeaders, payload);
