import { fromJS } from 'immutable';

const getBank = (bankId, bankCode, bankName, branchName, status) => ({
  bankId,
  bankCode,
  bankName,
  branchName,
  status,
});

export const bankList = fromJS([
  getBank(1, 'PBF', '民生银行', '民生分行', 1),
  getBank(2, 'PBF', '民生银行', '民生分行', 1),
  getBank(3, 'PBF', '民生银行', '民生分行', 1),
  getBank(4, 'PBF', '民生银行', '民生分行', 1),
  getBank(5, 'PBF', '民生银行', '民生分行', 1),
]);
