import { combineReducers } from 'redux';
import nav from './navReducer';
import auth from './authReducer';
import setting from './settingReducer';
import snackbar from './snackbarReducer';
import user from './userReducer';
import banks from './bankReducer';
import order from './orderReducer';
import role from './roleReducer';
import account from './accountReducer';
import pendingOrder from './pendingOrderReducer';
import userAccount from './userAccountReducer';

const reducer = combineReducers({
  nav,
  auth,
  setting,
  snackbar,
  banks,
  userAccount,
  order,
  role,
  account,
  pendingOrder,
  user,
});

export default reducer;
