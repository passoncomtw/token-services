import types from '~/constants/actionTypes';
import isEmpty from 'lodash/isEmpty';

const SHOULD_FORCE_LOGOUT_CODES = [201, 202, 203, 204, 205, 206, 207];

const NO_AUTH_ACTIONS = [
  types.LOGIN,
  types.LOGIN_ERROR,
  types.LOGIN_SUCCESS,
  types.LOGOUT,
  types.LOGOUT_ERROR,
  types.LOGOUT_SUCCESS,
];

export const authTokenMiddleware = store => next => action => {
  if (isEmpty(action.payload)) {
    return next(action);
  }

  const {
    payload: { code, message },
  } = action;

  if (
    SHOULD_FORCE_LOGOUT_CODES.includes(code) &&
    !NO_AUTH_ACTIONS.includes(action.type)
  ) {
    return next({
      type: types.SHOW_ALERT_DIALOG,
      payload: {
        alertType: 'FORCE_LOGOUT',
        level: 'info',
        mode: 'confirm',
        alertMessage: message,
      },
    });
  }

  return next(action);
};
