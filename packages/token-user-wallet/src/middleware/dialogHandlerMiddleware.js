import isEmpty from 'lodash/isEmpty';
import Toast from 'react-native-toast-message';

const getErrorMessage = (message) => {
  const re = /Network/;
  if (re.test(message)) return '暫無網絡，請您檢查是否連接網絡';
  return message;
};

export const dialogHandlerMiddleware = (store) => (next) => (action) => {
  const { dialog, ...nextAction } = action;

  if (!isEmpty(dialog)) {
    const { type, message } = dialog;
    Toast.show({
      type,
      text1: getErrorMessage(message),
    });
  }

  return next(nextAction);
};
