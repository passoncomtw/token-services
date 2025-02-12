const express = require('express');
const { Op } = require('sequelize');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const { getBankcards } = require('../services/bankcardServices');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { cardNumber, bankCode, bankName, branchName, account, name, page, size } = req.query;
    const whereCondition = {};
    const bankWhereCondition = {};

    if (cardNumber) {
      whereCondition.cardNumber = {
        [Op.like]: `%${cardNumber}%`
      };
    }

    if (name) {
      whereCondition.name = {
        [Op.like]: `%${name}%`
      };
    }

    if (branchName) {
      whereCondition.branchName = {
        [Op.like]: `%${branchName}%`,
      };
    }

    if (bankCode) {
      bankWhereCondition.bankCode = {
        [Op.like]: `%${bankCode}%`
      };
    }

    if (bankName) {
      bankWhereCondition.bankName = {
        [Op.like]: `%${bankName}%`
      };
    }

    if (account) {
      whereCondition['$user.account$'] = {
        [Op.like]: `%${account}%`
      };
    }

    const data = await getBankcards(whereCondition, bankWhereCondition, { page, size });
    responseOk(res, { success: true, data });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.get('/:bankcardId', async (req, res) => {
  try {
    const { bankcardId } = req.params;

    const [data] = await getBankcards({ id: bankcardId });
    responseOk(res, { success: true, data });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
