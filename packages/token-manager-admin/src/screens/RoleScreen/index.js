import RoleScreen from './view';
import { connect } from 'react-redux';
import { allPermissions } from '~/constants/mock/allPermissions';
import { getChildrenIdsByParentId } from '~/utils/permissionUtils';
import {
  getRoleListAction,
  addRoleAction,
  updateRoleAction,
  deleteRoleAction,
} from '~/actions/roleActions';
import { getPermissionTreeAction } from '~/actions/settingActions';

const mapStateToProps = ({ role, setting }) => ({
  list: role.get('rows'),
  total: role.get('count'),
  pages: parseInt(role.get('count') / 10) + 1,
  permissionTree: setting.get('permissionTree'),
  childrenIdsByParentId: getChildrenIdsByParentId(allPermissions),
});

const mapDispatchToProps = dispatch => ({
  handleGetPermissionTree: () => {
    dispatch(getPermissionTreeAction());
  },
  handleGetList: payload => {
    dispatch(getRoleListAction(payload));
  },
  handleAddRole: payload => {
    dispatch(addRoleAction(payload));
  },
  handleEditRole: payload => {
    dispatch(updateRoleAction(payload));
  },
  handleDeleteRole: payload => {
    dispatch(deleteRoleAction(payload));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(RoleScreen);
