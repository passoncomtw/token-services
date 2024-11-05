import constants from 'flux-constants';

const syncActionTypes = ['START_FETCHING', 'STOP_FETCHING', 'HANDLE_SIDEBAR'];

const layoutActionTypes = [
  'SIDEBAR_OPEN',
  'SIDEBAR_MENU_OPEN',
  'SHOW_ALERT_DIALOG',
  'HIDE_ALERT_DIALOG',
  'CLOSE_SNACK_BAR',
  'OPEN_SNACK_BAR',
];

export const basicAsyncActionTypes = [
  'LOGIN',
  'LOGOUT',
  'EDIT_PASSWORD',
  'CANCEL_ORDER',
  'CANCEL_PENDING_ORDER',
  'COMPLETE_ORDER',
  'DELETE_PENDING_ORDER',
  'GET_ORDER_LIST',
  'GET_PENDING_ORDER_LIST',
  'GET_USER_LIST',
  'GET_USER_ORDER_LIST',
  'GET_USER_PENDING_ORDER_LIST',
  'GET_BANK_LIST',
  'ADD_BANK',
  'EDIT_BANK',
  'OPEN_PENDING_ORDER',
  'STOP_PENDING_ORDER',
  'GET_USER_ACCOUNT_LIST',
  'GET_USER_ACCOUNT_LIST_BY_USER_ID',
  'DELETE_USER_ACCOUNT',
  'GET_ROLE_LIST',
  'ADD_ROLE',
  'UPDATE_ROLE',
  'DELETE_ROLE',
  'GET_PERMISSION_TREE',
  'GET_ACCOUNT_LIST',
  'ADD_ACCOUNT',
  'UPDATE_ACCOUNT',
  'DELETE_ACCOUNT',
  'ADD_USER',
  'GET_USER_INFO',
  'UPDATE_USER_INFO',
  'UPDATE_USER_PWD',
  'UPDATE_USER_TRANS_PWD',
  'UNLOCK_LOGIN',
  'UNLOCK_TRANSACTION',
];

const asyncActionTypes = basicAsyncActionTypes.reduce((result, actionType) => {
  return [
    ...result,
    actionType,
    `${actionType}_SUCCESS`,
    `${actionType}_ERROR`,
  ];
}, []);

export default constants([
  ...syncActionTypes,
  ...asyncActionTypes,
  ...layoutActionTypes,
]);
