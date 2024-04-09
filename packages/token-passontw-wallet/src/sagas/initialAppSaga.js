import types from '~/constants/actionTypes';
import { put, call } from 'redux-saga/effects';
import { showIntroScreen } from '~/actions/IntroductionActions';
import {
  getIsFirstRunApp,
  getUserInformation,
  setIsNotFirstRunApp,
} from '~/store/asyncStorageManager';

const setUserInformationAction = (payload) => ({
  type: types.SET_USER_INFORMATION,
  payload,
});

const okInitial = (payload) => ({
  type: types.INITIAL_APP_SUCCESS,
  payload,
});

const errInitial = () => ({
  type: types.INITIAL_APP_ERROR,
  payload: {},
});

const getAllInitialRequests = () => Promise.all([getUserInformation()]);

export function* initialAppSaga() {
  try {
    if (yield call(getIsFirstRunApp)) {
      yield put(showIntroScreen);
      yield call(setIsNotFirstRunApp);
    }

    const [user] = yield call(getAllInitialRequests);
    yield put(setUserInformationAction(user));

    const resAction = okInitial(user);
    yield put(resAction);
  } catch (error) {
    const errorAction = errInitial(error);
    yield put(errorAction);
  }
}
