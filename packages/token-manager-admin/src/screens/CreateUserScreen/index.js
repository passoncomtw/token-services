import ScreenView from './view';
import { connect } from 'react-redux';
import { addUserAction } from '~/actions/userActions';

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  handleAddUser: payload => {
    dispatch(addUserAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreenView);
