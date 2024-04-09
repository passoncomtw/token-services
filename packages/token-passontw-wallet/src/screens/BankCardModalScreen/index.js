import { connect } from 'react-redux';
import BankCardModalScreen from './view';
import { getCardsAction } from '~/actions/cardActions';

const mapStateToProps = ({cards}) => {
  const cardItems = cards.get("cards");
  sortedItems = cardItems
    .sort((a, b) => b.get('createdAt') - a.get('createdAt'))
    .toJS();
  return {
    sortedItems,
  }
};

const mapDispatchToProps = (dispatch) => ({
  handleGetCards: () => {
    dispatch(getCardsAction())
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(BankCardModalScreen);
