import { fromJS, Set } from 'immutable';
import { getLoginUser } from '../store/localStorage';
import isEmpty from 'lodash/isEmpty';

const DEFAULT_USER = {
  token: '',
  info: {
    userName: '',
  },
  permissions: {},
};

const user = getLoginUser();
const isAuth = !isEmpty(user);
const userData = isEmpty(user) ? DEFAULT_USER : user;

export const authState = fromJS({
  isAuth,
  isInitial: false,
  ...userData,
});

export const settingState = fromJS({
  fetchingTypes: Set(),
  permissionTree: [],
});

export const snackbarState = fromJS({
  open: false,
  message: '',
  type: 'info',
});

export const navState = fromJS({
  isSideBarOpened: false,
  isAlertDialogOpen: false,
  alertMessage: '',
  level: 'info',
  watchedMenu: '',
  alertType: '',
});

export const userState = fromJS({
  count: 0,
  rows: [],
  accountList: [],
  orderList: [],
  pendingList: [],
  refreshAt: '',
  userInfo: {},
});

export const bankState = fromJS({
  list: [],
});

export const userAccountState = fromJS({
  data: [],
  count: 0,
  pages: 0,
});

export const orderState = fromJS({
  list: [],
  totalCount: 0,
  totalPageCount: 0,
});

export const pendingOrderState = fromJS({
  list: [],
  totalCount: 0,
  totalPageCount: 0,
});

export const roleState = fromJS({
  rows: [],
  count: 0,
});

export const accountState = fromJS({
  rows: [],
  count: 0,
});
