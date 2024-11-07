import { connect } from 'react-redux';
import CreateOrderScreen from './view';
import { addOrderAction } from '~/actions/transactionActions';

const mapStateToProps = ({ auth, cards }) => ({
  isAuth: auth.get('isAuth'),
  cardItems: cards.get("cards").toJS(),
});

const mapDispatchToProps = (dispatch) => ({
  handleAddOrder: (payload) => {
    dispatch(addOrderAction(payload));
  },
  handleGetCards: () => {
    dispatch(getCardsAction())
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(CreateOrderScreen);
