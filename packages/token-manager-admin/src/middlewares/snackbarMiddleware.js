import types from '../constants/actionTypes';
import isEmpty from 'lodash/isEmpty';

export const snackbarMiddleware = store => next => action => {
  if (!isEmpty(action.snackbar)) {
    next({ type: types.OPEN_SNACK_BAR, payload: action.snackbar });
  }

  return next(action);
};
