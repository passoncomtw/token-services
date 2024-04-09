const database = require('../database/models');
const pick = require('lodash/pick');
const { getPaginationQuery } = require('../helpers/utils');

const parseBankcard = (item) => {
  const bankcard = pick(item, ['id', 'createdAt', 'name', 'cardNumber', 'branchName', 'status']);

  return {
    ...bankcard,
    account: item.user.account,
    bankId: item.bank.id,
    bankName: item.bank.bankName,
    bankCode: item.bank.bankCode,
  };
}

const getBankcards = async (whereCondition={}, bankWhereCondition={}, {page, size}) => {
  const { offset, limit } = getPaginationQuery(page, size);
  const {count, rows} = await database.Bankcard.findAndCountAll({    
    include: [{
      as: 'user',
      model: database.User,
      required: true,
    }, {
      as: 'bank',
      model: database.Bank,
      attributes: ['id', 'bankName', 'bankCode'],
      where: bankWhereCondition,
    }],
    attributes: ['id', 'createdAt', 'name', 'cardNumber', 'branchName', 'status'],
    where: whereCondition,
    offset,
    limit,
  });

  return {
    count,
    rows: rows.map(parseBankcard),
  };
};

module.exports.getBankcards = getBankcards;
