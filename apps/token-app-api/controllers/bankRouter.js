const express = require('express');
const { getBanks } = require('../services/bankServices');
const { responseErrWithMsg, responseOk } = require('../helpers/response');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await getBanks({ status: 1 });
    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
