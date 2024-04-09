import ScreenView from './view';
import { connect } from 'react-redux';
import {
  getUserInfoAction,
  updateUserInfoAction,
  getUserAccountListByUserIdAction,
  getUserOrderListAction,
  getUserPendingOrderListAction,
  updateUserPwdAction,
  updateUserTransactionPwdAction,
  unlockLoginAction,
  unlockTransactionAction,
} from '~/actions/userActions';
import { deleteUserAccountAction } from '~/actions/userAccountActions';
import { cancelOrderAction, completeOrderAction } from '~/actions/orderActions';
import {
  cancelPendingOrderAction,
  deletePendingOrderAction,
  openPendingOrderAction,
  stopPendingOrderAction,
} from '~/actions/pendingOrderActions';

const mapStateToProps = ({ user }) => ({
  refreshAt: user.get('refreshAt'),
  orders: user.get('orderList'),
  pendings: user.get('pendingList'),
  userInfo: user.get('userInfo'),
  accounts: user.get('accountList'),
});

const mapDispatchToProps = dispatch => ({
  handleGetUserOrderList: payload => {
    dispatch(getUserOrderListAction(payload));
  },
  handleCancelOrder: payload => {
    dispatch(cancelOrderAction(payload));
  },
  handleCompleteOrder: payload => {
    dispatch(completeOrderAction(payload));
  },
  handleGetUserPendingOrderList: payload => {
    dispatch(getUserPendingOrderListAction(payload));
  },
  handleCancelPendingOrder: payload => {
    dispatch(cancelPendingOrderAction(payload));
  },
  handleDeletePendingOrder: payload => {
    dispatch(deletePendingOrderAction(payload));
  },
  handleOpenPendingOrder: payload => {
    dispatch(openPendingOrderAction(payload));
  },
  handleStopPendingOrder: payload => {
    dispatch(stopPendingOrderAction(payload));
  },
  handleGetUserAccountsList: payload => {
    dispatch(getUserAccountListByUserIdAction(payload));
  },
  handleDeleteAccount: payload => {
    dispatch(deleteUserAccountAction(payload));
  },
  handleGetUserInfo: payload => {
    dispatch(getUserInfoAction(payload));
  },
  handleUpdateUserInfo: payload => {
    dispatch(updateUserInfoAction(payload));
  },
  handleUpdateUserPwd: payload => {
    dispatch(updateUserPwdAction(payload));
  },
  handleUpdateUserTransPwd: payload => {
    dispatch(updateUserTransactionPwdAction(payload));
  },
  handleUnlockLogin: payload => {
    dispatch(unlockLoginAction(payload));
  },
  handleUnlockTransaction: payload => {
    dispatch(unlockTransactionAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreenView);
