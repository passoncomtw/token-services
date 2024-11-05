import { fromJS } from 'immutable';

export const list = fromJS([
  {
    id: '1111',
    account: 'account001',
    username: 'username01',
    mail: '1123@gmail.com',
    type: 0,
    status: 1,
    transactionType: 0,
    orderType: 1,
    notes: '',
  },
  {
    id: '2222',
    account: 'account002',
    username: 'username02',
    mail: '222@gmail.com',
    type: 1,
    status: 0,
    transactionType: 1,
    orderType: 0,
    notes: '123123',
  },
]);
