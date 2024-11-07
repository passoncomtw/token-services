import { connect } from 'react-redux';
import { initialAppAction } from '~/actions/settingActions';
import InitManagerItem from './view';

const mapStateToProps = ({ setting }) => ({
  isInitialed: setting.get('isInitialed'),
});

const mapDispatchToProps = (dispatch) => ({
  handleInitial: () => {
    dispatch(initialAppAction());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(InitManagerItem);
