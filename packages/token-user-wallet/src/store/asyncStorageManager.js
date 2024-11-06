import AsyncStorage from '@react-native-async-storage/async-storage';

const APP_USER_INFORMATION = '_APP_USER_INFORMATION';
const IS_FIRST_RUN_APP = 'IS_FIRST_RUN_APP';

const parseToObj = (objStr) => {
  return objStr !== null ? JSON.parse(objStr) : {};
};

export const getIsFirstRunApp = () =>
  AsyncStorage.getItem(IS_FIRST_RUN_APP).then(
    (str) => JSON.parse(str) !== false
  );

export const getUserInformation = () =>
  AsyncStorage.getItem(APP_USER_INFORMATION).then(parseToObj);

export const saveUserInformation = (userInfo) =>
  AsyncStorage.setItem(APP_USER_INFORMATION, JSON.stringify(userInfo));

export const setIsNotFirstRunApp = () =>
  AsyncStorage.setItem(IS_FIRST_RUN_APP, JSON.stringify(false));

export const removeUserInformation = () =>
  AsyncStorage.removeItem(APP_USER_INFORMATION);
