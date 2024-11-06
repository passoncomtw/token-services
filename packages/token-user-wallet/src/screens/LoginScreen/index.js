import { connect } from 'react-redux';
import { loginAction } from '~/actions/authActions';
import LoginScreen from './view';

const mapStateToProps = ({ setting }) => ({
  showIntroScreen: setting.get('showIntroScreen'),
});

const mapDispatchToProps = (dispatch) => ({
  handleLogin: (payload) => {
    dispatch(loginAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
