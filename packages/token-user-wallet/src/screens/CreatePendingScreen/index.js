import { connect } from 'react-redux';
import CreatePendingScreen from './view';
import {
  addPendingOrderAction,
  getPendingDetailAction,
} from '~/actions/pendingActions';
import { getCardsAction } from '~/actions/cardActions';

const mapStateToProps = ({ auth, cards, pendingDetail }) => ({
  cardItems: cards.get("cards").toJS(),
  isAuth: auth.get('isAuth'),
  usefulBalance: auth.getIn(['user', 'wallet', 'usefulBalance']),
  pendingDetail,
});

const mapDispatchToProps = (dispatch) => ({
  handleGetCards: () => {
    dispatch(getCardsAction())
  },
  handleCreatePending: (payload) => {
    dispatch(addPendingOrderAction(payload));
  },
  handleGetPendingDetail: (payload) => {
    dispatch(getPendingDetailAction(payload));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreatePendingScreen);
