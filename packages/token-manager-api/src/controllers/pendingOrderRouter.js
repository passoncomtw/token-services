const express = require('express');
const isNull = require('lodash/isNull');
const { Op } = require('sequelize');
const { responseOk, responseErrWithMsg } = require('../helpers/response');
const { getPendingordersWithPagination, stopPendingOrder, openPendingOrder, cancelPendingOrder, softDeletePendingOrder } = require('../services/pendingorderServices');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      pendingOrderId,
      account,
      startAt,
      endAt,
      userId = null,
      minAmount = null,
      maxAmount = null,
      minBalance = null,
      maxBalance = null,
      page = 1,
      size = 10,
      ...query
    } = req.query;
    
    if (pendingOrderId) {
      query.id = pendingOrderId;
    }

    if (account) {
      query['$user.account$'] = account;
    }

    if (startAt && endAt) {
      query.createdAt = {
        [Op.gte]: new Date(startAt),
        [Op.lte]: new Date(endAt),
      };
    }

    if (!isNull(maxAmount) && !isNull(minAmount)) {
      query.amount = {
        [Op.gte]: Number(minAmount),
        [Op.lte]: Number(maxAmount),
      };
    }

    if (!isNull(maxBalance) && !isNull(minBalance)) {
      query.balance = {
        [Op.gte]: Number(minBalance),
        [Op.lte]: Number(maxBalance),
      };
    }

    if (!isNull(userId)) {
      query['$user.id$'] = userId;
    }

    const pendingOrdersResult = await getPendingordersWithPagination(query, { page, size });
    responseOk(res, { success: true, data: pendingOrdersResult });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:pendingOrderId/stop', async (req, res) => {
  try {
    const { pendingOrderId } = req.params;
    await stopPendingOrder(pendingOrderId);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:pendingOrderId/open', async (req, res) => {
  try {
    const { pendingOrderId } = req.params;
    await openPendingOrder(pendingOrderId);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.put('/:pendingOrderId/cancel', async (req, res) => {
  try {
    const { pendingOrderId } = req.params;
    await cancelPendingOrder(pendingOrderId);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

router.delete('/:pendingOrderId', async (req, res) => {
  try {
    const { pendingOrderId } = req.params;
    await softDeletePendingOrder(pendingOrderId);
    responseOk(res, { success: true });
  } catch (error) {
    responseErrWithMsg(res, error.message);
  }
});

module.exports = router;
