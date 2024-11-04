const { isEmpty } = require('lodash');
const { Op } = require('sequelize');
const database = require('../database/models');
const { getPaginationQuery } = require('../helpers/utils');

const DEFAULT_PENDINGORDER_SCHEMA = {
  include: [{
    as: 'user',
    model: database.User,
    required: true,
    attributes: ['id', 'name', 'account'],
    include: [
      {
        as: 'merchant',
        model: database.Merchant,
        required: true,
        attributes: ['createdAt', 'contactor', 'telegram', 'buyFeeType', 'sellFeeType', 'buyPercentageFee', 'buyLadderFee', 'sellPercentageFee', 'sellLadderFee'],
      },
    ],
  }, {
    as: 'bankcard',
    model: database.Bankcard,
    required: true,
    include: [{
      as: 'bank',
      model: database.Bank,
      attributes: ['id', 'bankName', 'bankCode'],
    }],
    attributes: ['id', 'createdAt', 'name', 'cardNumber', 'branchName', 'status'],
  }],
  attributes: ['id', 'type', 'status', 'amount', 'createdAt', 'balance', 'transactionMinutes', 'processCount', 'processAmount', 'doneCount', 'doneAmount', 'cancelCount', 'cancelAmount'],
};

const getPendingOrders = async (whereCondition = {}) => {
  const pendingOrdersResult = await database.PendingOrder.findAndCountAll({
    ...DEFAULT_PENDINGORDER_SCHEMA,
    where: whereCondition,
  });

  return pendingOrdersResult;
};

const getPendingordersWithPagination = async (whereCondition = {}, query) => {
  const { page = 1, size = 10 } = query;
  const { offset, limit } = getPaginationQuery(page, size);
  
  const pendingOrdersResult = await database.PendingOrder.findAndCountAll({
    ...DEFAULT_PENDINGORDER_SCHEMA,
    where: whereCondition,
    offset,
    limit,
  });
  const rows = pendingOrdersResult.rows.map(({bankcard, ...pendingOrder}) => {
    const data = pendingOrder.dataValues;
    return {
      ...data,
      bankcard: {
        id: bankcard.id,
        createdAt: bankcard.createdAt,
        name: bankcard.name,
        cardNumber: bankcard.cardNumber,
        status: bankcard.status,
        bankName: bankcard.bank.bankName,
        bankCode: bankcard.bank.bankCode,
      },
    }
  });

  return {
    rows,
    count: pendingOrdersResult.count,
  };
};

const stopPendingOrder = async (pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: {
      id: pendingOrderId,
    },
  });

  if(isEmpty(pendingOrderResult)) {
    throw new Error('掛單不存在');
  }

  if(pendingOrderResult.status !== 0) {
    throw new Error('只有掛賣中的掛單可以暫停');
  }

  pendingOrderResult.status = 1;
  await pendingOrderResult.save();
};

const openPendingOrder = async (pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: {
      id: pendingOrderId,
    },
  });

  if(isEmpty(pendingOrderResult)) {
    throw new Error('掛單不存在');
  }

  if(pendingOrderResult.status !== 1) {
    throw new Error('只有暫停的掛單可以重新開啟');
  }

  pendingOrderResult.status = 0;
  await pendingOrderResult.save();
};

const cancelPendingOrder = async (pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: {
      id: pendingOrderId,
    },
  });

  if(isEmpty(pendingOrderResult)) {
    throw new Error('掛單不存在');
  }

  if(![0, 1].includes(pendingOrderResult.status)) {
    throw new Error('只有暫停或掛賣的掛單可以取消掛單');
  }

  pendingOrderResult.status = 2;
  await pendingOrderResult.save();
};

const softDeletePendingOrder = async (pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: { id: pendingOrderId },
  });

  if (isEmpty(pendingOrderResult)) {
    throw new Error('掛單不存在');
  }

  const orderCount = await database.Order.count({
    include: [{
      as: 'pendingOrder',
      model: database.PendingOrder,
      required: true,
    }],
    where: {
      status: {
        [Op.in]: [0, 1],
      },
      "$pendingOrder.id$": pendingOrderId,
    }
  });
  
  if (orderCount !== 0) {
    throw new Error('尚有交易進行中');
  }
  await pendingOrderResult.destroy();
};

module.exports.DEFAULT_PENDINGORDER_SCHEMA = DEFAULT_PENDINGORDER_SCHEMA;
module.exports.getPendingOrders = getPendingOrders;
module.exports.getPendingordersWithPagination = getPendingordersWithPagination;
module.exports.stopPendingOrder = stopPendingOrder;
module.exports.openPendingOrder = openPendingOrder;
module.exports.cancelPendingOrder = cancelPendingOrder;
module.exports.softDeletePendingOrder = softDeletePendingOrder;