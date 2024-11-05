import { fromJS } from 'immutable';

export const data = fromJS([
  {
    accountId: 1,
    name: 'test-1',
    username: 'testa',
    status: 0,
    roleList: [1, 2, 3],
  },
  {
    accountId: 2,
    name: 'test-2',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
  {
    accountId: 3,
    name: 'test-3',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
  {
    accountId: 4,
    name: 'test-4',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
  {
    accountId: 5,
    name: 'test-5',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
  {
    accountId: 6,
    name: 'test-6',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
  {
    accountId: 7,
    name: 'test-7',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
  {
    accountId: 8,
    name: 'test-8',
    username: 'testa',
    status: 1,
    roleList: [1, 2, 3, 4, 5, 6],
  },
]);

export const records = {
  list: data,
  page: 1,
  size: 10,
  total: 5,
  pages: 5,
};
