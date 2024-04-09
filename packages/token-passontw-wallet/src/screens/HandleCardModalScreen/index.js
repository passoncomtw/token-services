import { connect } from "react-redux";
import HandleCardModalScreen from "./view";
import {
  addCardAction,
  getCardsAction,
  updateCardAction,
  deleteCardAction,
} from "~/actions/cardActions";
import { getBankAction } from '~/actions/bankActions';

const mapStateToProps = ({banks}) => {
  return {
    banks: banks.get("list").toJS(),
  };
};

const mapDispatchToProps = (dispatch) => ({
  handleGetBanks: () => {
    dispatch(getBankAction())
  },
  handleGetCards: () => {
    dispatch(getCardsAction());
  },
  handleAddCard: (payload) => {
    dispatch(addCardAction(payload));
  },
  handleUpdateCard: (payload) => {
    dispatch(updateCardAction(payload));
  },
  handleDeleteCard: (payload) => {
    dispatch(deleteCardAction(payload));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HandleCardModalScreen);
