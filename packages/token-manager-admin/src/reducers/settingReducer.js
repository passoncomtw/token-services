import { settingState } from './initialState';
import types from '~/constants/actionTypes';
import { fromJS } from 'immutable';

export default function reducer(setting = settingState, { type, payload }) {
  switch (type) {
    case types.GET_PERMISSION_TREE_SUCCESS:
      return setting.update('permissionTree', item =>
        item.merge(fromJS(payload))
      );
    case types.START_FETCHING:
      return setting.update('fetchingTypes', currentValue =>
        currentValue.add(payload)
      );
    case types.STOP_FETCHING:
      return setting.update('fetchingTypes', currentValue =>
        currentValue.delete(payload)
      );
    case types.GET_PERMISSION_TREE:
    case types.GET_PERMISSION_TREE_ERROR:
    default:
      return setting;
  }
}
