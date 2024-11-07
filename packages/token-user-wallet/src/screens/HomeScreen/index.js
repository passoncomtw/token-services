import { connect } from 'react-redux';
import { getCardsAction } from '~/actions/cardActions';
import { getUserInfoAction } from '~/actions/userActions';

import HomeScreen from './view';

const mapStateToProps = ({ auth, cards }) => {
  const user = auth.get('user');
  const wallet = auth.getIn(['user', 'wallet']);

  return {
    id: user.get('id'),
    cards: cards.get('cards'),
    isAuth: auth.get('isAuth'),
    usefulBalance: wallet.get('usefulBalance'),
    guaranteedBalance: wallet.get('freezeBalance'),
  };
};

const mapDispatchToProps = (dispatch) => ({
  handleGetUserInfo: (payload) => {
    dispatch(getUserInfoAction(payload));
  },
  handleGetCards: () => {
    dispatch(getCardsAction());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(HomeScreen);
