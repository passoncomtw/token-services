import AccountScreen from './view';
import { connect } from 'react-redux';
import {
  addAccountAction,
  getAccountListAction,
  updateAccountAction,
  deleteAccountAction,
} from '~/actions/accountActions';
import { allRoles } from '~/constants/mock/allRoles';
import { listToMap } from '~/utils/format';

const mapStateToProps = ({ account }) => ({
  records: account.get('rows'),
  allRoles: allRoles.toJS(),
  allRoleMap: listToMap(allRoles, 'roleId', 'roleName'),
  roles: [],
  pages: parseInt(account.get('count') / 10) + 1,
  total: account.get('count'),
});

const mapDispatchToProps = dispatch => ({
  handleGetAction: payload => {
    dispatch(getAccountListAction(payload));
  },
  handleAddAction: payload => {
    dispatch(addAccountAction(payload));
  },
  handleUpdateAction: payload => {
    dispatch(updateAccountAction(payload));
  },
  handleDeleteAction: payload => {
    dispatch(deleteAccountAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountScreen);
