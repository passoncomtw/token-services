import { combineReducers } from 'redux';
import auth from './authReducer';
import banks from './bankReducer';
import cards from './cardsReducer';
import orders from './orderReducer';
import setting from './settingReducer';
import transactions from './transactionReducer';
import pendingOrder from './pendingOrderReducer';
import pendingDetail from './pendingDetailReducer';

export default combineReducers({
  auth,
  cards,
  banks,
  orders,
  setting,
  transactions,
  pendingOrder,
  pendingDetail,
});
