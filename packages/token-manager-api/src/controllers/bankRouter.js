const express = require('express');
const yup = require('yup');
const { getBanks, createBank, updateBank } = require('../services/bankServices');
const router = express.Router();
const { responseOk, responseErrWithMsg } = require('../helpers/response');

router.get('/', async (req, res) => {
  try {
    const data = await getBanks();
    responseOk(res, { success: true, data });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});


const createBankRequestSchema = yup.object({
  bankName: yup.string().required('bankName 不可為空'),
  bankCode: yup.string().required('bankCode 不可為空'),
});

router.post('/', async (req, res) => {
  try {
    const validation = await createBankRequestSchema.validate(req.body);
    const data = await createBank(validation);
    responseOk(res, { success: true, data });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put('/:bankId', async (req, res) => {
  try {
    const validation = await createBankRequestSchema.validate(req.body);
    const { bankId } = req.params;
    const data = await updateBank(bankId, validation);
    responseOk(res, { success: true, data });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
