const express = require('express');
const router = express.Router();
const yup = require("yup");
const { jwtAuthorizationMiddleware } = require("../helpers/passportManager");
const { responseErrWithMsg, responseOk } = require('../helpers/response');
const { getAllPendingOrders } = require('../services/pendingOrderServices');
const { createUser, getUser, updateUser, updateUserLoginPassword, updateUserTransactionPassword, storeValueByUserId } = require('../services/userServices');

const parsePendingOrderItem = (pendingOrders) => {
  if (pendingOrders.length === 0) return {};
  const buy = pendingOrders.find(item => item.type === 0);
  const sell = pendingOrders.find(item => item.type === 1);
  return { buy, sell };
}
router.get('/pending/orders', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const userId = req.user.data.id;
    const whereCondition = { user_id: userId };

    const {rows: pendingOrders} = await getAllPendingOrders(whereCondition);
    const result = parsePendingOrderItem(pendingOrders);
    responseOk(res, { success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await getUser(userId);
    responseOk(res, { success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

const updatePasswordSchema = yup.object({
  password: yup.string().required('密碼不可為空'),
  newPassword: yup.string().required('修改密碼欄位不可為空'),
});

router.put('/transaction/password', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    await updatePasswordSchema.validate(req.body);
    const userId = req.user.data.id;
    await updateUserTransactionPassword(userId, req.body);
    responseOk(res, { success: true });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put('/login/password', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    await updatePasswordSchema.validate(req.body);
    const userId = req.user.data.id;
    await updateUserLoginPassword(userId, req.body);
    responseOk(res, { success: true });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put('/:userId', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await updateUser(userId, req.body);
    responseOk(res, { success: true, data: result });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

const registerRequestSchema = yup.object({
  name: yup.string().required('暱稱不可為空'),
  transactionCode: yup.string().required("交易密碼不可為空").matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,20}$/, "交易密碼格式不正確"),
  email: yup.string().email('email 格式錯誤').required('信箱不可為空'),
  password: yup.string().required('密碼不可為空'),
  referralCode: yup.string(),
});

router.post('/', async (req, res) => {
  try {
    await registerRequestSchema.validate(req.body);
    const result = await createUser(req.body);
    const userResult = await getUser(result.id);
    responseOk(res, { success: true, data: userResult });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.post('/:userId/store/value', async (req, res) => {
  try {
    const { userId } = req.params;
    await storeValueByUserId(userId);
    responseOk(res, { success: true });
  } catch (error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

module.exports = router;
