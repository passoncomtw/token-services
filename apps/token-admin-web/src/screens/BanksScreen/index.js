import BanksScreen from './view';
import { connect } from 'react-redux';
import {
  getBankListAction,
  addBankAction,
  editBankAction,
} from '~/actions/bankActions';

const mapStateToProps = ({ banks }) => ({
  list: banks.get('list'),
});

const mapDispatchToProps = dispatch => ({
  handleGetList: payload => {
    dispatch(getBankListAction(payload));
  },
  handleAdd: payload => {
    dispatch(addBankAction(payload));
  },
  handleEdit: payload => {
    dispatch(editBankAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(BanksScreen);
