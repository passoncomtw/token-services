import { connect } from 'react-redux';
import { registryAction } from '~/actions/authActions';
import RegistryScreen from './view';

const mapStateToProps = ({ auth }) => ({
  isAuth: auth.get('isAuth'),
});

const mapDispatchToProps = (dispatch) => ({
  handleRegistry: (payload) => {
    dispatch(registryAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RegistryScreen);
