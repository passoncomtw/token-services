import LayoutWrapper from './view';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { logoutAction, editPasswordAction } from '~/actions/authActions';
import {
  switchSideBarAction,
  switchMenuAction,
  showAlertDialogAction,
  hideAlertDialogAction,
  closeSnackBarAction,
  openSnackBarAction,
} from '~/actions/navActions';

const mapStateToProps = ({ auth, nav, snackbar }) => ({
  isAuth: auth.get('isAuth'),
  token: auth.getIn(['info', 'token']),
  alertType: nav.get('alertType'),
  isSideBarOpened: nav.get('isSideBarOpened'),
  alertMessage: nav.get('alertMessage'),
  //level: nav.get('level'),
  isAlertDialogOpen: nav.get('isAlertDialogOpen'),
  userName: auth.getIn(['info', 'userName']),
  roleName: auth.getIn(['info', 'roleName']),
  open: snackbar.get('open'),
  message: snackbar.get('message'),
  permissions: auth.get('permissions'),
});

const mapDispatchToProps = dispatch => ({
  handleLogout: payload => {
    dispatch(logoutAction(payload));
  },
  sideBarSwitch: payload => {
    dispatch(switchSideBarAction(payload));
  },
  setWatchMenu: payload => {
    dispatch(switchMenuAction(payload));
  },
  closeSnackBar: () => {
    dispatch(closeSnackBarAction());
  },
  showAlertDialog: payload => {
    dispatch(showAlertDialogAction(payload));
  },
  hideAlertDialog: () => {
    dispatch(hideAlertDialogAction());
  },
  handleOpenSnackBar: payload => {
    dispatch(openSnackBarAction(payload));
  },
  handleEditPassowrd: payload => {
    dispatch(editPasswordAction(payload));
  },
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(LayoutWrapper)
);
