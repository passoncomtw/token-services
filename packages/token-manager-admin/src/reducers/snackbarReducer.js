import { snackbarState } from './initialState';
import types from '../constants/actionTypes';

const openSnackBar = (snackbar, payload) => {
  return snackbar.merge({
    open: true,
    message: payload.message,
    level: payload.level,
  });
};

const closeSnackBar = snackbar => {
  return snackbar.update('open', () => false);
};

export default function reducer(snackbar = snackbarState, { type, payload }) {
  switch (type) {
    case types.OPEN_SNACK_BAR:
      return openSnackBar(snackbar, payload);
    case types.CLOSE_SNACK_BAR:
      return closeSnackBar(snackbar);
    default:
      return snackbar;
  }
}
