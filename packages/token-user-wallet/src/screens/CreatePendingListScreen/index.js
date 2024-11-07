import { connect } from 'react-redux';
import CreatePendingListScreen from './view';

const mapStateToProps = ({ pendingOrder }) => ({
  buy: pendingOrder.get('buy'),
  sell: pendingOrder.get('sell'),
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePendingListScreen);
