const express = require('express');
const router = express.Router();
const yup = require("yup");
const isEmpty = require('lodash/isEmpty');
const { Op } = require("sequelize");
const { responseErrWithMsg, responseOk } = require('../helpers/response');
const { createPendingOrder, getPendingOrders, getPendingOrder, lockPendingOrder, unlockPendingOrder, deletePendingOrder } = require("../services/pendingOrderServices");
const { jwtAuthorizationMiddleware } = require('../helpers/passportManager');

router.get('/', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const { type, balance, page = 1, size = 10 } = req.query;
    const userId = req.user.data.id;

    const whereCondition = {
      status: 0,
    };

    if (!isEmpty(type)) {
      whereCondition.type = Number(type)
    }

    if (isEmpty(balance)) {
      whereCondition.balance = {
        [Op.gt]: 0,
      };
    } else {
      whereCondition.balance = Number(balance);
    }

    const result = await getPendingOrders(whereCondition, req.query);

    return responseOk(res, {
      success: true,
      data: result,
    });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});


router.get('/:pending_order_id', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const { pending_order_id: pendingOrderId } = req.params;

    const data = await getPendingOrder(pendingOrderId);
    res.json({ success: true, data });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

const createOrderRequestSchema = yup.object({
  bankcardId: yup.number().required('銀行卡不可為空'),
  type: yup.mixed().oneOf([0, 1], '掛單類型錯誤'),
  amount: yup.number().required("數量格式錯誤").min(100, '數量低於最小額度'),
  minAmount: yup.number().required("最小額度格式錯誤").min(100, '最小額度過低'),
  transactionCode: yup.string().required("交易密碼不可為空").matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,20}$/, "交易密碼格式不正確"),
  transactionMinutes: yup.number().required("等待時間格式錯誤").min(5, "訂單等待時間過低").max(120, "訂單等待時間過高"),
});

router.post('/', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    await createOrderRequestSchema.validate(req.body);

    const userId = req.user.data.id;
    const result = await createPendingOrder(userId, req.body);

    return responseOk(res, {
      success: true,
      data: result,
    });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:pending_order_id/lock', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const userId = req.user.data.id;
    const { pending_order_id: pendingOrderId } = req.params;

    await lockPendingOrder(userId, pendingOrderId);
    res.json({ success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:pending_order_id/unlock', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const userId = req.user.data.id;
    const { pending_order_id: pendingOrderId } = req.params;

    await unlockPendingOrder(userId, pendingOrderId);
    res.json({ success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.delete('/:pending_order_id', jwtAuthorizationMiddleware, async (req, res) => {
  try {
    const userId = req.user.data.id;
    const { pending_order_id: pendingOrderId } = req.params;

    await deletePendingOrder(userId, pendingOrderId);
    res.json({ success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

module.exports = router;
