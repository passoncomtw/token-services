import types from '~/constants/actionTypes';
import { settingState } from '../initialState';
import settingsReducer from '../settingReducer';

const { describe, it } = global;

let settings = null;

describe('settings reducer unitest', () => {
  beforeEach(() => {
    settings = settingsReducer(settingState, { type: 'INITIAL' });
  });

  it('should fetching', () => {
    const startFetchingAction = {
      type: types.START_FETCHING,
      payload: 'LOGIN',
    };
    const stopFetchingAction = { type: types.STOP_FETCHING, payload: 'LOGIN' };
    expect(settings.get('fetchingTypes').size).toBe(0);

    const afterOpenSidebar = settingsReducer(settings, startFetchingAction);
    expect(afterOpenSidebar.get('fetchingTypes').size).toBe(1);

    const afterCloseSidebar = settingsReducer(
      afterOpenSidebar,
      stopFetchingAction
    );

    expect(afterCloseSidebar.get('fetchingTypes').size).toBe(0);
  });
});
