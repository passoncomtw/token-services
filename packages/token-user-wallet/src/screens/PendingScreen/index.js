import { connect } from 'react-redux';
import {
  getPendingOrderAction,
  lockPendingOrderAction,
  startPendingOrderAction,
  deletePendingOrderAction,
} from '~/actions/pendingActions';
import PendingScreen from './view';

const mapStateToProps = ({ pendingOrder }) => ({
  buy: pendingOrder.get('buy'),
  sell: pendingOrder.get('sell'),
});

const mapDispatchToProps = (dispatch) => ({
  handleGetPendingOrder: () => {
    dispatch(getPendingOrderAction());
  },
  handleLockPendingOrder: (payload) => {
    dispatch(lockPendingOrderAction(payload));
  },
  handleDeletePendingOrder: (payload) => {
    dispatch(deletePendingOrderAction(payload));
  },
  handleStartPendingOrder: (payload) => {
    dispatch(startPendingOrderAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(PendingScreen);
