import GlobalArea from './view';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import {
  switchSideBarAction,
  switchMenuAction,
  showAlertDialogAction,
  hideAlertDialogAction,
  closeSnackBarAction,
  openSnackBarAction,
} from '~/actions/navActions';

const mapStateToProps = ({ auth, nav, snackbar }) => ({
  auth,
  nav,
  snackbar,
});

const mapDispatchToProps = dispatch => ({
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
});

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(GlobalArea)
);
