import { connect } from 'react-redux';
import { logoutAction } from '~/actions/authActions';
import About from './view';

const mapStateToProps = ({ auth }) => ({
  username: auth.getIn(['user', 'name']),
  referralCode: auth.getIn(['user', 'referralCode']),
});

const mapDispatchToProps = (dispatch) => ({
  handleLogout: () => {
    dispatch(logoutAction());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(About);
