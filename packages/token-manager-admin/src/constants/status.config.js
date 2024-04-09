import colors from '~/theme/colors';

const SUCCESS = colors.success;
const PROCCESSING = colors.primary;
const WARNING = colors.warning;
const ERROR = colors.danger;

export const WHETHER_STATUS_TEXT = ['否', '是'];
export const ACTIVE_STATUS_TEXT = ['停用', '啓用'];
export const ACTIVE_STATUS_COLOR = [ERROR, SUCCESS];

export const ACTIVE_STATUS_ITEMS = [
  { name: '啓用', value: 1 },
  { name: '停用', value: 0 },
];

export const ORDER_TYPE_TEXT = {
  0: '未付款',
  1: '已付款',
  2: '已完成',
  3: '已取消',
  4: '已取消',
};

export const ORDER_TYPE_LIST = {
  0: 'PROCCESS_UNPAY',
  1: 'PROCCESS_PAY',
  2: 'SUCCESS',
  3: 'CANCEL',
  4: 'CANCEL',
};

export const USER_TYPE_TEXT = {
  0: '一般會員',
  1: '商家',
};

export const USER_ORDER_TYPE_TEXT = {
  0: ORDER_TYPE_TEXT[0],
  1: ORDER_TYPE_TEXT[1],
  2: ORDER_TYPE_TEXT[2],
  3: ORDER_TYPE_TEXT[3],
};

export const TRANSACTION_TYPE_TEXT = {
  0: '購買',
  1: '出售',
};

export const TRANSACTION_TIMEING_TEXT = {
  0: '進行中',
  1: '已逾時',
};

export const PENDING_STATUS_TEXT = ['掛單中', '暫停掛單', '取消掛單'];
export const PENDING_STATUS_COLOR = [PROCCESSING, WARNING, ERROR];
export const PENDING_STATUS = {
  PROCESSING: 0,
  PENDING: 1,
  CANCELED: 2,
};

export const DIALOG_MODE = {
  ADD: 'ADD',
  EDIT: 'EDIT',
  DELETE: 'DELETE',
};
