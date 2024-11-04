const express = require('express');
const { isEmpty } = require('lodash');
const isNull = require('lodash/isNull');
const { Op } = require('sequelize');
const database = require('../database/models');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const { getOrders, cancelOrder, finishOrder } = require('../services/orderServices');

const router = express.Router();

router.get('/', async (req, res) => {
  const {
    orderId,
    account,
    payer,
    cancelReason,
    startAt,
    endAt,
    finishAtType,
    type = null,
    status = null,
    minAmount = null,
    maxAmount = null,
    page = 1,
    size = 10,
  } = req.query;

  const whereCondition = {};
  const pendingOrderWhereCondition = {};

  if (finishAtType) {
    if (finishAtType === 'overdue') {
      whereCondition.finishAt = {
        [Op.ne]: null,
        [Op.and]: [database.Sequelize.literal(`'Order.finish_at' > 'Order.expect_finish_at'`)]
      };
    } else {
      whereCondition.finishAt = {
        [Op.and]: [database.Sequelize.literal(`'Order.finish_at' < 'Order.expect_finish_at'`)]
      };
    }
  }

  if (account) {
    whereCondition['$user.account$'] = { [Op.like]: account };
  }

  if (cancelReason) {
    whereCondition.cancelReason = {
      [Op.like]: `%${cancelReason}%`
    };
  }

  if (payer) {
    whereCondition['$pendingOrder.bankcard.name$'] = { [Op.like]: payer };
    whereCondition['$bankcard.name$'] = { [Op.like]: payer };
  }

  if (orderId) {
    whereCondition.id = orderId;
  }

  if (!isNull(status)) {
    whereCondition.status = status;
  }

  if (!isNull(type)) {
    whereCondition['$pendingOrder.type$'] = type;
  }

  if (!isEmpty(startAt) && !isEmpty(endAt)) {
    whereCondition.createdAt = {
      [Op.between]: [new Date(startAt), new Date(endAt)],
    };
  }

  if (!isNull(minAmount) && !isNull(maxAmount)) {
    whereCondition.amount = {
      [Op.between]: [minAmount, maxAmount],
    };
  }

  const data = await getOrders({
    whereCondition,
    pendingOrderWhereCondition,
  }, {page, size});

  return responseOk(res, { success: true, data });
});

router.put('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    await finishOrder(orderId, req.body);
    const orders = await getOrders({ whereCondition: {id: orderId} });
    responseOk(res, { success: true, data: orders.rows[0] });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }  
});

router.put('/:orderId/cancel', async (req, res) => {
  try {
    const { orderId } = req.params;
    await cancelOrder(orderId, req.body);
    const orders = await getOrders({ whereCondition: {id: orderId} });
    responseOk(res, { success: true, data: orders.rows[0] });
  } catch(error) {
    const status = error.status || 500;
    responseErrWithMsg(res, error.message, status);
  }  
});

module.exports = router;
