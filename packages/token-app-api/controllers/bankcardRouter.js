const express = require('express');
const router = express.Router();
const yup = require("yup");
const { getBankcards, createBankcard, updateBankcard, deleteBankcard } = require('../services/bankcardServices');
const { responseErrWithMsg, responseOk } = require('../helpers/response');

router.get('/', async (req, res) => {
  try {
    const userId = req.user.data.id;
    const result = await getBankcards(userId);
    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

const requestBankcardSchema = yup.object({
  name: yup.string().required('姓名不可為空'),
  cardNumber: yup.string().required('卡號不可為空'),
  bankId: yup.string().required('銀行Id不可為空'),
  branchName: yup.string().required('分行名稱不可為空'),
});

const updateBankcardSchema = yup.object({
  cardNumber: yup.string(),
  bankId: yup.string().required('銀行Id不可為空'),
  branchName: yup.string().required('分行名稱不可為空'),
});

router.post('/', async (req, res) => {
  try {
    const userId = req.user.data.id;
    await requestBankcardSchema.validate(req.body);
    const result = await createBankcard(userId, req.body);
    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put("/:bankcard_id", async (req, res) => {
  try {
    const {bankcard_id} = req.params;
    const userId = req.user.data.id;
    await updateBankcardSchema.validate(req.body);
    const result = await updateBankcard(bankcard_id, userId, req.body);
    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.delete("/:bankcard_id", async (req, res) => {
  try {
    const {bankcard_id: bankcardId} = req.params;
    const userId = req.user.data.id;
    await deleteBankcard(bankcardId, userId);
    responseOk(res, { success: true });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
