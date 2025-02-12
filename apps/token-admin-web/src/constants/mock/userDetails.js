import { fromJS } from 'immutable';

export const pureList = {
  id: 1,
  account: 'account001',
  username: 'username01',
  email: '1123@gmail.com',
  type: 0,
  status: 1,
  transactionType: 0,
  orderType: 1,
  amount: 20000,
  balance: 123123,
  deposit: 1000,
  // basicInfo
  registerTime: '2020-07-21 20:00:59',
  contactor: 'Edmond',
  phone: '0988555222',
  telegram: 'edmond5411',
  refererCode: 'SDFDFKJG',
  referer: 'TOMAS',
  transStatus: 0,
  pendingStatus: 1,
  loginLock: 1,
  transLock: 1,
  remark: '',
  buying: {
    feeType: 1,
    feePercent: 0.6,
    minFee: 0,
    maxFee: 1000,
  },
  selling: {
    feeType: 2,
    steps: [
      { amount: 100, feePercent: 0.1 },
      { amount: 1000, feePercent: 0.5 },
    ],
  },
};

export const list = fromJS(pureList);
