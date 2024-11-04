const { Op } = require('sequelize');
const database = require('../database/models');

const getBanks = async () => {
  const banksResult = database.Bank.findAll({
    attributes: ['id', 'status', 'bankName', 'bankCode'],
  });
  return banksResult;
};

const createBank = async (body) => {
  const bankResult = await database.Bank.findOne({
    where: { bankCode: body.bankCode },
  });

  if (bankResult) {
    throw new Error('銀行已存在');
  }

  await database.Bank.create({
    bankName: body.bankName,
    bankCode: body.bankCode,
    status: 1,
  });

};

const updateBank = async (bankId, body) => {
  const bankCodeResult = await database.Bank.findOne({
    where: {
      id: {
        [Op.ne]: bankId,
      },
      bankCode: body.bankCode
    },
  });

  if (bankCodeResult) {
    throw new Error('bankCode 已存在');
  }

  const bankResult = await database.Bank.findOne({
    where: { id: bankId },
  });

  if (!bankResult) {
    throw new Error('銀行不存在');
  }

  bankResult.bankName = body.bankName;
  bankResult.bankCode = body.bankCode;

  await bankResult.save();
};

module.exports.createBank = createBank;
module.exports.updateBank = updateBank;
module.exports.getBanks = getBanks;
