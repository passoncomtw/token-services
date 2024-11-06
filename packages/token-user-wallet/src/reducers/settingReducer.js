import types from '~/constants/actionTypes';
import { settingState } from './initialState';

const initialSuccess = (setting) => setting.merge({ isInitialed: true });

export default function reducer(setting = settingState, { type, payload }) {
  switch (type) {
    case types.INITIAL_APP_SUCCESS:
      return initialSuccess(setting);
    case types.SHOW_INTRO_SCREEN:
      return setting.merge({ showIntroScreen: true });
    case types.HIDE_INTRO_SCREEN:
      return setting.merge({ showIntroScreen: false });
    case types.INITIAL_APP:
    case types.INITIAL_APP_ERROR:
    default:
      return setting;
  }
}
