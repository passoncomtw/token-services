import types from '~/constants/actionTypes';
import { authState } from './initialState';
import { fromJS, updateIn } from 'immutable';
import { saveUserInformation } from '~/store/asyncStorageManager';

const updateUserInfo = (auth, payload) => {
  const updateResult = updateIn(auth, ['user'], (user) =>
    user.merge(fromJS(payload))
  );
  saveUserInformation(updateResult.toJS());

  return updateResult;
};

export default function reducer(auth = authState, { type, payload }) {
  switch (type) {
    case types.INITIAL_APP_SUCCESS:
      return auth.merge(fromJS(payload));
    case types.LOGOUT_SUCCESS:
      return authState;
    case types.LOGIN_SUCCESS:
      return auth.merge(fromJS(payload));
    case types.SET_USER_INFORMATION:
      return auth.merge(fromJS({ ...payload }));
    case types.UPDATE_USER_INFO_SUCCESS:
      return updateUserInfo(auth, payload);
    case types.UPDATE_USER_INFO:
    case types.UPDATE_USER_INFO_ERROR:
    case types.REGISTRY_SUCCESS:
    case types.REGISTRY_ERROR:
    case types.REGISTRY:
    case types.LOGIN_ERROR:
    case types.LOGIN:
    case types.LOGOUT_ERROR:
    case types.LOGOUT:
    default:
      return auth;
  }
}
