import { connect } from 'react-redux';
import ConfirmOrderScreen from './view';
import {
  paidOrderAction,
  releaseOrderAction,
} from '~/actions/transactionActions';

const mapStateToProps = ({}) => ({});

const mapDispatchToProps = (dispatch) => ({
  handlePaidOrder: (payload) => {
    dispatch(paidOrderAction(payload));
  },
  handleReleaseOrder: (payload) => {
    dispatch(releaseOrderAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmOrderScreen);
