import ScreenView from './view';
import { connect } from 'react-redux';
import {
  cancelPendingOrderAction,
  deletePendingOrderAction,
  getPendingOrderListAction,
  openPendingOrderAction,
  stopPendingOrderAction,
} from '~/actions/pendingOrderActions';

const mapStateToProps = ({ pendingOrder }) => ({
  data: pendingOrder.get('list'),
  totalCount: pendingOrder.get('totalCount'),
  totalPageCount: pendingOrder.get('totalPageCount'),
});

const mapDispatchToProps = dispatch => ({
  handleCancelPendingOrder: payload => {
    dispatch(cancelPendingOrderAction(payload));
  },
  handleDeletePendingOrder: payload => {
    dispatch(deletePendingOrderAction(payload));
  },
  handleOpenPendingOrder: payload => {
    dispatch(openPendingOrderAction(payload));
  },
  handleStopPendingOrder: payload => {
    dispatch(stopPendingOrderAction(payload));
  },
  handleGetList: payload => {
    dispatch(getPendingOrderListAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreenView);
