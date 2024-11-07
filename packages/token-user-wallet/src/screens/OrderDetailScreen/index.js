import { connect } from 'react-redux';
import OrderDetailScreen from './view';
import {
  paidOrderAction,
  releaseOrderAction,
} from '~/actions/transactionActions';

const mapStateToProps = ({ auth, orders }) => ({
  authUserId: auth.getIn(['user', 'id']),
  orders: orders.get('list'),
});

const mapDispatchToProps = (dispatch) => ({
  handlePaidOrder: (payload) => {
    dispatch(paidOrderAction(payload));
  },
  handleReleaseOrder: (payload) => {
    dispatch(releaseOrderAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetailScreen);
