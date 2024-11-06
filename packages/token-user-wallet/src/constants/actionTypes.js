import constants from 'flux-constants';

const syncActionTypes = [
  'SET_USER_INFORMATION',
  'SHOW_INTRO_SCREEN',
  'HIDE_INTRO_SCREEN',
];

const basicAsyncActionTypes = [
  'LOGIN',
  'LOGOUT',
  'REGISTRY',
  'INITIAL_APP',
  'GET_CARD_LIST',
  'ADD_CARD',
  'UPDATE_CARD',
  'DELETE_CARD',
  'ADD_ORDER',
  'PAID_ORDER',
  'RELEASE_ORDER',
  'CANCEL_ORDER',
  'GET_PENDING_ORDER',
  'ADD_PENDING_ORDER',
  'LOCK_PENDING_ORDER',
  'START_PENDING_ORDER',
  'DELETE_PENDING_ORDER',
  'GET_PENDING_DETAIL',
  'GET_BANK_LIST',
  'GET_ORDERS',
  'GET_SELLER_LIST',
  'GET_BUYER_LIST',
  'GET_USER_INFO',
  'UPDATE_USER_INFO',
  'UPDATE_PASSWORD',
  'SHOW_GLOBAL_MESSAGE',
  'HIDE_GLOBAL_MESSAGE',
];

const asyncActionTypes = basicAsyncActionTypes.reduce((result, actionType) => {
  return [
    ...result,
    actionType,
    `${actionType}_SUCCESS`,
    `${actionType}_ERROR`,
  ];
}, []);

export default constants([...asyncActionTypes, ...syncActionTypes]);
