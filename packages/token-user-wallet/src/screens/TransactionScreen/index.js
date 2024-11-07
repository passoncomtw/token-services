import { connect } from 'react-redux';
import TransactionScreen from './view';
import {
  getSellerListAction,
  getBuyerListAction,
} from '~/actions/transactionActions';

const mapStateToProps = ({ auth, transactions }) => ({
  isAuth: auth.get('isAuth'),
  sellerList: transactions.get('sellerList').toJS(),
  buyerList: transactions.get('buyerList').toJS(),
});

const mapDispatchToProps = (dispatch) => ({
  handleGetSellerList: (payload) => {
    dispatch(getSellerListAction(payload));
  },
  handleGetBuyerList: (payload) => {
    dispatch(getBuyerListAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(TransactionScreen);
