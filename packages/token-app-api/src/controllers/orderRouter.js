const express = require('express');
const router = express.Router();
const yup = require("yup");
const { responseErrWithMsg, responseOk } = require('../helpers/response');
const { createOrder, getOrders, getOrder, updateOrderPaidStatus, updateOrderApplyStatus, updateOrderRejectStatus } = require('../services/orderServices');

const createOrderRequestSchema = yup.object({
  beneficiaryBankcardId: yup.number().required('銀行卡不可為空'),
  type: yup.mixed().oneOf([0, 1], '掛單類型錯誤'),
  orderId: yup.string().required("訂單編號不可為空"),
  amount: yup.number().required("額度格式錯誤"),
  transactionCode: yup.string().required("交易密碼不可為空").matches(/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z0-9]{6,20}$/, "交易密碼格式不正確"),
});

router.get('/', async (req, res) => {
  try {
    const whereCondition = {};
    const pendingOrderWhereCondition = {};

    const result = await getOrders({
      whereCondition,
      pendingOrderWhereCondition,
    }, req.query);

    return responseOk(res, {
      success: true,
      data: result,
    });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.post('/', async (req, res) => {
  try {
    await createOrderRequestSchema.validate(req.body);

    const userId = req.user.data.id;
    const newOrder = await createOrder(userId, req.body);

    const result = await getOrder({ id: newOrder.id });
    return responseOk(res, {
      success: true,
      data: result,
    });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put("/:order_id/reject", async (req, res) => {
  try {
    const {order_id: orderId} = req.params;
    const userId = req.user.data.id;
    await updateOrderRejectStatus(userId, orderId, req.body);
    const result = await getOrder({ id: orderId })

    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put("/:order_id/apply", async (req, res) => {
  try {
    const {order_id: orderId} = req.params;
    const userId = req.user.data.id;
    await updateOrderApplyStatus(userId, orderId);

    const result = await getOrder({ id: orderId });
    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});

router.put("/:order_id/paid", async (req, res) => {
  try {
    const {order_id: orderId} = req.params;
    const userId = req.user.data.id;
    const result = await updateOrderPaidStatus(userId, orderId);
    responseOk(res, { success: true, data: result });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }
});


module.exports = router;
