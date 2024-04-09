import UserListScreen from './view';
import { connect } from 'react-redux';
import { getUserListAction } from '~/actions/userActions';

const mapStateToProps = ({ user }) => ({
  users: user.get('rows'),
  userCount: user.get('count'),
});

const mapDispatchToProps = dispatch => ({
  handleGetList: payload => {
    dispatch(getUserListAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UserListScreen);
