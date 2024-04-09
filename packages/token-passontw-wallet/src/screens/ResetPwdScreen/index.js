import { connect } from 'react-redux';
import ResetPwdScreen from './view';
import { updatePasswordAction } from '~/actions/userActions';

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = (dispatch) => ({
  handleUpdatePwd: (payload) => {
    dispatch(updatePasswordAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPwdScreen);
