import { navState } from './initialState';
import types from '../constants/actionTypes';

const openAlertDialog = (nav, payload) => {
  return nav.merge({
    isAlertDialogOpen: true,
    ...payload,
  });
};

const closeAlertDialog = nav => {
  return nav.update('isAlertDialogOpen', () => false);
};

export default function reducer(nav = navState, { type, payload }) {
  switch (type) {
    case types.SIDEBAR_OPEN:
      return nav.update('isSideBarOpened', () => payload);
    case types.SIDEBAR_MENU_OPEN:
      return nav.update('watchedMenu', () => payload);
    case types.SHOW_ALERT_DIALOG:
      return openAlertDialog(nav, payload);
    case types.HIDE_ALERT_DIALOG:
      return closeAlertDialog(nav);
    default:
      return nav;
  }
}
