import { connect } from 'react-redux';
import MainScreen from './view';

const mapStateToProps = ({ auth }) => ({
  isAuth: auth.get('isAuth'),
});

const mapDispatchToProps = dispatch => ({});

export default connect(mapStateToProps, mapDispatchToProps)(MainScreen);
