import colors from '~/theme/color';

const SUCCESS = colors.success;
const PROCCESSING = colors.primary;
const WARNING = colors.warning;
const ERROR = colors.error;

export const PENDING_TYPE_TEXT = ['購買', '出售'];
export const PENDING_TYPE = {
  0: 'BUY',
  1: 'SELL',
};

export const PENDING_STATUS_TEXT = ['掛單中', '暫停掛單', '取消掛單'];
export const PENDING_STATUS_COLOR = [PROCCESSING, WARNING, ERROR];
export const PENDING_STATUS = {
  PROCESSING: 0,
  PENDING: 1,
  CANCELED: 2,
};

export const ORDER_CATEGRORY_TEXT = ['進行中', '已完成'];
export const ORDER_PROCESS_TEXT = ['全部', '未付款', '已付款'];
export const ORDER_SUCCESS_TEXT = ['全部', '已完成', '已取消'];

export const ORDER_CATEGRORY_LIST = {
  0: 'PROCCESSING',
  1: 'SUCCESS',
};

export const ORDER_PROCCESS_LIST = {
  PROCCESS_UNPAY: 1,
  PROCCESS_PAY: 2,
};

export const ORDER_SUCCESS_LIST = {
  SUCCESS: 1,
  CANCEL: 2,
};

export const ORDER_PROCCESS_STATUS = {
  0: 'PROCCESS_UNPAY',
  1: 'PROCCESS_PAY',
};
export const ORDER_SUCCESS_STATUS = {
  2: 'SUCCESS',
  3: 'CANCEL',
  4: 'CANCEL',
};

export const ORDER_STATUS = {
  ...ORDER_PROCCESS_STATUS,
  ...ORDER_SUCCESS_STATUS,
};

export const ORDER_STATUE_TEXT = {
  0: ORDER_PROCESS_TEXT[1],
  1: ORDER_PROCESS_TEXT[2],
  2: ORDER_SUCCESS_TEXT[1],
  3: ORDER_SUCCESS_TEXT[2],
  4: ORDER_SUCCESS_TEXT[2],
};

export const ORDER_TYPE = {
  BUY: 0, // 買幣
  SALE: 1, // 賣幣
};

export const ORDER_STATUS_COLOR = {
  0: ERROR,
  1: SUCCESS,
  2: SUCCESS,
  3: ERROR,
  4: ERROR,
};

export const PWD_TYPE = {
  PWD: 'login',
  TRANS: 'transaction',
};
