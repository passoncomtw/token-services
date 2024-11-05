import UserAccountScreen from './view';
import { connect } from 'react-redux';
import {
  deleteUserAccountAction,
  getUserAccountListAction,
} from '~/actions/userAccountActions';

const mapStateToProps = ({ userAccount }) => ({
  list: userAccount.get('data'),
});

const mapDispatchToProps = dispatch => ({
  handleGetList: payload => {
    dispatch(getUserAccountListAction(payload));
  },
  handleDeleteAccount: payload => {
    dispatch(deleteUserAccountAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(UserAccountScreen);
