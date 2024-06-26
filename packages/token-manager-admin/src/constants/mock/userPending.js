import { fromJS } from 'immutable';

export const pureList = [0, 1, 2, 3, 4].map(id => ({
  id,
  account: 'timmy',
  isSplit: true,
  type: id % 2,
  status: id % 3,
  amount: 10000,
  minAmount: 1000,
  balance: 10000,
  expireMinutes: 15,
  user: {
    id: 1,
    type: 0,
    account: 'simon',
    name: 'simon',
    email: 'aaa@bbb.ccc',
    createAt: 1131231311322,
    merchant: {
      createAt: 1131231311322,
      contactor: '溫蒂s',
      telegram: 'abcccccc',
      buyFeeType: 0,
      sellFeeType: 0,
      buyPercentageFee: [],
      sellPercentageFee: [],
      buyLadderFee: [],
      sellLadderFee: [],
    },
  },
  bankcard: {
    id: 0,
    createAt: 12312312312,
    name: '溫蒂',
    cardNumber: '1234567890123456789',
    bankName: '中國銀行',
    branchName: '分行名稱',
    status: 0,
  },
  createAt: 2312131312,
  processCount: 2,
  processAmount: 1000,
  successCount: 1,
  successAmount: 1000,
  cancelCount: 1,
  cancelAmount: 1000,
}));

export const list = fromJS(pureList);
