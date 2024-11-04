const database = require("../database/models");
const isEmpty = require("lodash/isEmpty");
const pick = require("lodash/pick");

const parseBankcard = (item) => {
  const bankcard = pick(item, ["id", "createdAt", "name", "cardNumber", "branchName", "status", "user"]);

  return {
    ...bankcard,
    bankId: item.bank.id,
    bankName: item.bank.bankName,
    bankCode: item.bank.bankCode,
  };
}

const getBankcards = async (userId) => {
  const bankcards = await database.Bankcard.findAll({
    attributes: ["id", "createdAt", "name", "cardNumber", "branchName", "status"],
    include: [{
      as: 'user',
      model: database.User,
      required: true,
      attributes: [],
    }, {
      as: "bank",
      model: database.Bank,
      attributes: ["id", "bankName", "bankCode"],
    }],
    where: { "user_id": userId },
  });

  return bankcards.map(parseBankcard)
};

const getBankcard = async (whereCondition) => {
  const [result = {}] = await database.Bankcard.findAll({
    include: [{
      as: "user",
      model: database.User,
      attributes: ["id", "name"],
    }, {
      as: "bank",
      model: database.Bank,
      attributes: ["id", "bankName", "bankCode"],
    }],
    where: whereCondition,
  });
  if (isEmpty(result)) return result;
  return parseBankcard(result);
};

module.exports.deleteBankcard = async (bankcardId, userId) => {
  const existBankcard = await database.Bankcard.findOne({
    include: [{
      as: "user",
      model: database.User,
      attributes: ["id", "name"],
    }, {
      as: "bank",
      model: database.Bank,
      attributes: ["id", "bankName", "bankCode"],
    }],
    where: { id: Number(bankcardId) },
  });

  const existUser = await database.User.findOne({
    where: { id: userId },
  });


  if (isEmpty(existUser)) {
    throw new Error("使用者不存在");
  }

  if (isEmpty(existBankcard)) {
    throw new Error("銀行卡不存在");
  }
  
  if (userId !== existBankcard.user.id) {
    throw new Error("僅能修改自己的銀行卡");
  }

  await existBankcard.destroy();
};

module.exports.updateBankcard = async (bankcardId, userId, body) => {
  const existBankcard = await database.Bankcard.findOne({
    include: [{
      as: "user",
      model: database.User,
      attributes: ["id", "name"],
    }, {
      as: "bank",
      model: database.Bank,
      attributes: ["id", "bankName", "bankCode"],
    }],
    where: { id: Number(bankcardId) },
  });
  const existUser = await database.User.findOne({
    where: { id: userId },
  });

  if (!isEmpty(body.cardNumber) && existBankcard.user.id !== userId) {
    const validateBankcard = await getBankcard({ cardNumber: body.cardNumber });
    if (!isEmpty(validateBankcard)) {
      throw new Error("卡號已存在");
    }
  }

  if (isEmpty(existUser)) {
    throw new Error("使用者不存在");
  }
  
  if (userId !== existBankcard.user.id) {
    throw new Error("僅能修改自己的銀行卡");
  }

  if (isEmpty(existBankcard)) {
    throw new Error("銀行卡不存在");
  }

  if (!isEmpty(body.cardNumber)) {
    existBankcard.cardNumber = body.cardNumber;
  }
  const { bankId = null } = body;
  if (!isEmpty(bankId)) {
    existBankcard.bankId = bankId;
  }

  if (!isEmpty(body.branchName)) {
    existBankcard.branchName = body.branchName;
  }

  await existBankcard.save();
  return getBankcard({ id: existBankcard.id });
};

const createBankcard = async (userId, body) => {

  const existBankcard = await getBankcard({ cardNumber: body.cardNumber });

  const existBank = await database.Bank.findOne({
    where: { id: body.bankId },
  });

  const existUser = await database.User.findOne({
    where: { id: userId },
  });

  if (isEmpty(existUser)) {
    throw new Error("使用者不存在");
  }

  if (isEmpty(existBank)) {
    throw new Error("銀行不存在");
  }

  if (!isEmpty(existBankcard)) {
    throw new Error("銀行卡已存在");
  }

  const result = await database.Bankcard.create({
    name: body.name,
    cardNumber: body.cardNumber,
    branchName: body.branchName,
  });

  await existBank.addBankcard(result.id);
  await existUser.addBankcard(result.id);
  return getBankcard({ id: result.id });
};

module.exports.createBankcard = createBankcard;
module.exports.getBankcard = getBankcard;
module.exports.getBankcards = getBankcards;