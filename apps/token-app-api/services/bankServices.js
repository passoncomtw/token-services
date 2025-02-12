const database = require("../database/models");

const getBanks = async (whereCondition = {}) => {
  const banks = await database.Bank.findAll({
    attributes: ["id", "createdAt", "bankName", "bankCode", "status"],
    where: whereCondition,
  });

  return banks;
};

module.exports.getBanks = getBanks;
