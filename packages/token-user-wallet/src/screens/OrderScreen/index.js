import { connect } from 'react-redux';
import OrderScreen from './view';
import { getOrdersAction } from '~/actions/orderAction';

const mapStateToProps = ({ orders }) => ({
  ordersList: orders.get('list').toJS(),
});

const mapDispatchToProps = (dispatch) => ({
  handleGetOrder: (payload) => {
    dispatch(getOrdersAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderScreen);
