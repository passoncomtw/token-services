import { fromJS } from 'immutable';

export const authState = fromJS({
  isAuth: false,
  token: '',
  user: {
    wallet: {},
  },
});

export const settingState = fromJS({
  isInitialed: false,
  showIntroScreen: false,
});

export const transactionState = fromJS({
  sellerList: [],
  buyerList: [],
});

export const cardState = fromJS({
  cards: [],
});

export const pendingOrderState = fromJS({
  buy: {},
  sell: {},
});

export const pendingDetailState = fromJS({
  amount: '',
  bankcard: {},
  isSplit: true,
  minAmount: 100,
  transactionMinutes: 15,
});

export const bankState = fromJS({
  list: [],
});

export const orderState = fromJS({
  list: [],
});

export const statisticState = fromJS({
  totalAmount: 888888,
  availableAmount: 99999,
  depositAmount: 99999,
});
