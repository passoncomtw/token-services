import { connect } from 'react-redux';
import UserScreen from './view';
import { updateUserInfoAction } from '~/actions/userActions';

const mapStateToProps = ({ auth }) => ({
  userId: auth.getIn(['user', 'id']),
  name: auth.getIn(['user', 'name']),
  account: auth.getIn(['user', 'account']),
  email: auth.getIn(['user', 'email']),
});

const mapDispatchToProps = (dispatch) => ({
  handleUpdateUser: (payload) => {
    dispatch(updateUserInfoAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UserScreen);
