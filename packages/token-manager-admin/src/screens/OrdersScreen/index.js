import ScreenView from './view';
import { connect } from 'react-redux';
import {
  cancelOrderAction,
  completeOrderAction,
  getOrderListAction,
} from '~/actions/orderActions';

const mapStateToProps = ({ order }) => ({
  data: order.get('list'),
  totalCount: order.get('totalCount'),
  totalPageCount: order.get('totalPageCount'),
});

const mapDispatchToProps = dispatch => ({
  handleCancelOrder: payload => {
    dispatch(cancelOrderAction(payload));
  },
  handleCompleteOrder: payload => {
    dispatch(completeOrderAction(payload));
  },
  handleGetList: payload => {
    dispatch(getOrderListAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ScreenView);
