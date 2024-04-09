import { fromJS } from 'immutable';

export const pureList = [0, 1, 2, 3, 4].map(orderType => ({
  id: orderType,
  account: 'user01',
  status: 0,
  amount: 1000,
  finishAt: 12312313,
  transactionType: orderType % 2,
  transactionTime: orderType % 2,
  orderType,
  reason: '22222',
  sender: {
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
  beneficiary: {
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
  senderBankcard: {
    id: 0,
    createAt: 12312312312,
    name: '溫蒂',
    cardNumber: '1234567890123456789',
    bankName: '中國銀行',
    branchName: '分行名稱',
    status: 0,
  },
  beneficiaryBankcard: {
    id: 0,
    createAt: 12312312312,
    name: '溫蒂',
    cardNumber: '1234567890123456789',
    bankName: '中國銀行',
    branchName: '分行名稱',
    status: 0,
  },
  createAt: 123132131231,
}));

export const list = fromJS(pureList);
