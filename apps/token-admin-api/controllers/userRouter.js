const express = require('express');
const yup = require('yup');
const { Op } = require('sequelize');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const { getUsers, getUserDetail, createUser, updateUser, updateSelfPassword, unlockUser, updateUserLoginPassword, updateUserTransactionPassword } = require('../services/userServices');
const { getBankcards } = require('../services/bankcardServices');
const { getPendingordersWithPagination } = require('../services/pendingorderServices');
const { getOrders } = require('../services/orderServices');
const { isNull } = require('lodash');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      name,
      email,
      account,
      status = null,
      isMerchant = null,
      orderStatus = null,
      transactionStatus = null,
      page = 1,
      size = 10,
    } = req.query;
    const whereCondition = {};

    if (account) {
      whereCondition.account = {
        [Op.like]: `%${account}%`,
      };
    }

    if (name) {
      whereCondition.name = {
        [Op.like]: `%${name}%`,
      };
    }

    if (email) {
      whereCondition.email = {
        [Op.like]: `%${email}%`,
      };
    }

    if (!isNull(status)) {
      whereCondition.status = status;
    }

    if (!isNull(orderStatus)) {
      whereCondition.orderStatus = orderStatus;
    }

    if (!isNull(transactionStatus)) {
      whereCondition.transactionStatus = transactionStatus;
    }

    if (!isNull(isMerchant)) {
      if (isMerchant === 'true') {
        whereCondition['$merchant.id$'] = {
          [Op.ne]: null,
        };
      } else {
        whereCondition['$merchant.id$'] = null;
      }
    }

    const usersResult = await getUsers(whereCondition, { page, size });
    responseOk(res, { success: true, data: usersResult });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const usersResult = await getUserDetail({ id: userId });
    responseOk(res, { success: true, data: usersResult });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.get('/:userId/bankcards', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page, size } = req.query;
    const bankcardsResult = await getBankcards({ user_id: userId }, {}, { page, size });
    responseOk(res, { success: true, data: bankcardsResult });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.get('/:userId/pending/orders', async (req, res) => {
  try {
    const { userId } = req.params;

    const data = await getPendingordersWithPagination({ user_id: userId }, req.query);
    responseOk(res, { success: true, data });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.get('/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    const whereCondition = { user_id: userId };
    const pendingOrderWhereCondition = {};

    const pindingOrderResult = await getOrders(whereCondition, pendingOrderWhereCondition);
    responseOk(res, { success: true, data: pindingOrderResult.rows });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

const createUserRequestSchema = yup.object({
  type: yup.mixed().oneOf([0, 1]),
  buyFeeType: yup.mixed().oneOf([0, 1]),
  sellFeeType: yup.mixed().oneOf([0, 1]),
  // buyPercentageFee: yup.object().shape({
  //   feePercent: yup.number().required('buyPercentageFee.feePercent 不可為空'),
  //   minFee: yup.number().required('buyPercentageFee.minFee 不可為空'),
  //   maxFee: yup.number().required('buyPercentageFee.maxFee 不可為空'),
  // }).required('buyPercentageFee 不可為空'),
  // sellPercentageFee: yup.object().shape({
  //   feePercent: yup.number().required('buyPercentageFee.feePercent 不可為空'),
  //   minFee: yup.number().required('buyPercentageFee.minFee 不可為空'),
  //   maxFee: yup.number().required('buyPercentageFee.maxFee 不可為空'),
  // }).required('sellPercentageFee 不可為空'),
  // buyLadderFee: yup.array().of(yup.object().shape({
  //   amount: yup.number().required('buyLadderFee.amount 不可為空'),
  //   feePercent: yup.number().required('buyLadderFee.amount 不可為空'),
  // })).required('buyLadderFee 不可為空'),
  // sellLadderFee: yup.array().of(yup.object().shape({
  //   amount: yup.number().required('buyLadderFee.amount 不可為空'),
  //   feePercent: yup.number().required('buyLadderFee.amount 不可為空'),
  // })).required('buyLadderFee 不可為空'),
  account: yup.string().required('帳號不可為空'),
  name: yup.string().required('暱稱不可為空'),
  email: yup.string().required('Email 不可為空'),
  password: yup.string().required('密碼 不可為空'),
});

router.post('/', async (req, res) => {
  try {
    console.log("🚀 ~ router.post ~ req.body:", req.body)
    await createUserRequestSchema.validate(req.body);
    await createUser(req.body);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

const updateUserRequestSchema = yup.object({
  name: yup.string().required('暱稱不可為空'),
  phone: yup.string().required('phone 不可為空'),
  email: yup.string().required('Email 不可為空'),
  contactor: yup.string().required('Contactor 不可為空'),
  telegram: yup.string().required('Telegram 不可為空'),
  type: yup.mixed().oneOf([0, 1]).required('type 不可為空'),
  status: yup.mixed().oneOf([0, 1]).required('status 不可為空'),
  orderStatus: yup.mixed().oneOf([0, 1]).required('orderStatus 不可為空'),
  transactionStatus: yup.mixed().oneOf([0, 1]).required('transactionStatus 不可為空'),
  buyFeeType: yup.mixed().oneOf([0, 1]).required('buyFeeType 不可為空'),
  sellFeeType: yup.mixed().oneOf([0, 1]).required('sellFeeType 不可為空'),
  // buyPercentageFee: yup.object().shape({
  //   feePercent: yup.number().required('buyPercentageFee.feePercent 不可為空'),
  //   minFee: yup.number().required('buyPercentageFee.minFee 不可為空'),
  //   maxFee: yup.number().required('buyPercentageFee.maxFee 不可為空'),
  // }).required('buyPercentageFee 不可為空'),
  // sellPercentageFee: yup.object().shape({
  //   feePercent: yup.number().required('buyPercentageFee.feePercent 不可為空'),
  //   minFee: yup.number().required('buyPercentageFee.minFee 不可為空'),
  //   maxFee: yup.number().required('buyPercentageFee.maxFee 不可為空'),
  // }).required('sellPercentageFee 不可為空'),
  // buyLadderFee: yup.array().of(yup.object().shape({
  //   amount: yup.number().required('buyLadderFee.amount 不可為空'),
  //   feePercent: yup.number().required('buyLadderFee.amount 不可為空'),
  // })).required('buyLadderFee 不可為空'),
  // sellLadderFee: yup.array().of(yup.object().shape({
  //   amount: yup.number().required('buyLadderFee.amount 不可為空'),
  //   feePercent: yup.number().required('buyLadderFee.amount 不可為空'),
  // })).required('buyLadderFee 不可為空'),
});

router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const validation = await updateUserRequestSchema.validate(req.body);
    await updateUser(userId, validation);
    const data = await getUserDetail({ id: userId });
    responseOk(res, { success: true, data });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

const updateSelfPasswordRequestSchema = yup.object({
  password: yup.string().required('舊密碼不可為空'),
  newPassword: yup.string().required('新密碼不可為空'),
});

router.put('/login/password', async (req, res) => {
  try {
    const userId = req.user.data.id;
    const validation = await updateSelfPasswordRequestSchema.validate(req.body);
    await updateSelfPassword(userId, validation);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:userId/unlock', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await unlockUser(userId);
    responseOk(res, { success: true, data });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:userId/unlock', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await unlockUser(userId);
    responseOk(res, { success: true, data });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

const updatePasswordRequestSchema = yup.object({
  password: yup.string().trim().matches(/^.*(?=.{6,20})(?=.*\d)(?=.*[a-z|A-Z]).*$/, '6~20 的英數組合').required('密碼 不可為空'),
});

router.put('/:userId/login/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const validation = await updatePasswordRequestSchema.validate(req.body);

    await updateUserLoginPassword(userId, validation);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:userId/transaction/password', async (req, res) => {
  try {
    const { userId } = req.params;
    const validation = await updatePasswordRequestSchema.validate(req.body);

    await updateUserTransactionPassword(userId, validation);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

module.exports = router;
