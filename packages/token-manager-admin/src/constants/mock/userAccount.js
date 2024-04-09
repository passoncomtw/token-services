import { fromJS } from 'immutable';

export const pureList = [0, 1, 2, 3].map(id => ({
  id,
  account: `edmond${id}`,
  username: `EDMOND${id}`,
  bankName: '民生银行',
  cardNumber: '1237447646354321',
  branchName: '民生支行',
}));

export const list = fromJS(pureList);
