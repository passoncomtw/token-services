const database = require("../database/models");
const isEmpty = require("lodash/isEmpty");
const isNull = require("lodash/isNull");
const { getBankcard } = require("./bankcardServices");
const { getPaginationQuery } = require("../helpers/utils");
const { validateTransactionCode } = require("../helpers/passportManager");
const { Op } = require("sequelize");

const DEFAULT_PENDINGORDER_SCHEMA = {
  include: [{
    as: 'user',
    model: database.User,
    required: true,
    attributes: ["id", "name"],
  }, {
    as: 'bankcard',
    model: database.Bankcard,
    required: true,
    include: [{
      as: "bank",
      model: database.Bank,
      attributes: ["id", "bankName", "bankCode"],
    }],
    attributes: ["id", "createdAt", "name", "cardNumber", "branchName", "status"],
  }],
  attributes: ["id", "isSplit", "type", "status", "amount", "minAmount", "balance", "processAmount", "processCount", "doneAmount", "doneCount", "cancelAmount", "cancelCount", "transactionMinutes"],
};

const getPendingOrder = async (pendingOrderId, otherSchemas = []) => {
  const attributes = [...DEFAULT_PENDINGORDER_SCHEMA.attributes, ...otherSchemas];
  return await database.PendingOrder.findOne({
    ...DEFAULT_PENDINGORDER_SCHEMA,
    attributes,
    where: { id: pendingOrderId },
  })
};

const getAllPendingOrders = async (whereCondition) => {
  const pendingOrdersResult = await database.PendingOrder.findAndCountAll({
    ...DEFAULT_PENDINGORDER_SCHEMA,
    attributes: [...DEFAULT_PENDINGORDER_SCHEMA.attributes, 'cancelAmount', 'doneAmount', 'processAmount', 'processCount', 'doneCount', 'cancelCount'],
    where: whereCondition,
  });

  return pendingOrdersResult;
};

const getPendingOrders = async (whereCondition = {}, query = {}) => {
  const { page = 1, size = 10 } = query;
  const { offset, limit } = getPaginationQuery(page, size);
  const pendingOrdersResult = await database.PendingOrder.findAndCountAll({
    ...DEFAULT_PENDINGORDER_SCHEMA,
    offset,
    limit,
    where: whereCondition,
  });

  return pendingOrdersResult;
};

const createPendingOrderBySellDollar = async (userResult, bankcardResult, body) => {
  const { minAmount = null } = body;
  const isSplit = !isNull(minAmount);
  if (isSplit && minAmount < 100) {
    throw new Error("minAmount 必須大於等於 100");
  }

  const minAmountValue = isSplit
    ? body.minAmount
    : body.amount;

  const userWalletFreezeBalance = userResult.wallet.freezeBalance + body.amount;
  const userWalletUsefulBalance = userResult.wallet.usefulBalance - body.amount;

  const result = await database.sequelize.transaction(async t => {
    const walletPromise = database.Wallet.update({
      freezeBalance: userWalletFreezeBalance,
      usefulBalance: userWalletUsefulBalance,
    }, {
      where: { user_id: userResult.id },
    }, { transaction: t });

    const pendingOrderPromise = database.PendingOrder.create({
      ...body,
      type: 1,
      minAmount: minAmountValue,
      user_id: userResult.id,
      bank_card_id: bankcardResult.id,
      isSplit: isSplit,
      status: 0,
      telegram: '',
      contactor: '',
      balance: body.amount,
      processAmount: 0,
      cancelAmount: 0,
      doneAmount: 0,
      doneCount: 0,
      cancelCount: 0,
      processCount: 0,
    }, { transaction: t });

    const [result] = await Promise.all([
      pendingOrderPromise,
      walletPromise,
    ]);

    return result;
  });

  return await getPendingOrder(result.id);
};

const createPendingOrderByBuyDollar = async (userResult, bankcardResult, body) => {
  const { minAmount = null } = body;
  const isSplit = !isNull(minAmount);
  if (isSplit && minAmount < 100) {
    throw new Error("minAmount 必須大於等於 100");
  }

  const minAmountValue = isSplit
    ? body.minAmount
    : body.amount;

  const result = await database.PendingOrder.create({
    ...body,
    isSplit,
    type: 0,
    minAmount: minAmountValue,
    user_id: userResult.id,
    bank_card_id: bankcardResult.id,
    status: 0,
    telegram: '',
    contactor: '',
    balance: body.amount,
    processAmount: 0,
    cancelAmount: 0,
    doneAmount: 0,
    doneCount: 0,
    cancelCount: 0,
    processCount: 0,
  });

  return await getPendingOrder(result.id);
};

const createPendingOrder = async (userId, body) => {
  if (![0, 1].includes(body.type)) {
    throw new Error("類型錯誤");
  }

  const existPendingOrder = await database.PendingOrder.findOne({
    where: {
      status: 0,
      type: body.type,
      user_id: userId,
    },
  });

  if (existPendingOrder) {
    const errormessage = body.type === 0
      ? "買幣 只能掛單只能一張"
      : "賣幣 只能掛單只能一張";
    throw new Error(errormessage);
  }

  const userResult = await database.User.findOne({
    include: [{
      as: 'wallet',
      model: database.Wallet,
      required: true,
    }],
    where: { id: userId },
  });

  const bankcardResult = await getBankcard({ id: body.bankcardId, user_id: userId });

  if (isEmpty(userResult)) {
    throw new Error("使用者不存在");
  }

  if (isEmpty(bankcardResult)) {
    throw new Error("銀行卡不存在");
  }

  const isValidated = validateTransactionCode(userResult, body.transactionCode);
  if (!isValidated) {
    throw new Error("交易密碼不正確");
  }

  if (body.type === 0) {
    return createPendingOrderByBuyDollar(userResult, bankcardResult, body);
  } else {
    return createPendingOrderBySellDollar(userResult, bankcardResult, body);
  }
};

const lockPendingOrder = async (userId, pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: {
      id: pendingOrderId,
    },
  });

  if (!pendingOrderResult) {
    throw new Error('掛單不存在');
  }

  if (pendingOrderResult.user_id !== userId) {
    throw new Error('權限不足');
  }

  if (pendingOrderResult.status !== 0) {
    throw new Error('狀態錯誤');
  }

  const orderCount = await database.Order.count({
    where: {
      pending_order_id: pendingOrderId,
      status: {
        [Op.in]: [0, 1],
      },
    },
  });

  if (orderCount !== 0) {
  throw new Error('尚有交易進行中');
  }

  pendingOrderResult.status = 1;
  await pendingOrderResult.save();
};

const unlockPendingOrder = async (userId, pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: {
      id: pendingOrderId,
    },
  });

  if (!pendingOrderResult) {
    throw new Error('掛單不存在');
  }

  if (pendingOrderResult.user_id !== userId) {
    throw new Error('權限不足');
  }

  if (pendingOrderResult.status !== 1) {
    throw new Error('狀態錯誤');
  }

  pendingOrderResult.status = 0;
  await pendingOrderResult.save();
};

const deletePendingOrder = async (userId, pendingOrderId) => {
  const pendingOrderResult = await database.PendingOrder.findOne({
    where: {
      id: pendingOrderId,
    },
  });

  if (!pendingOrderResult) {
    throw new Error('掛單不存在');
  }

  if (pendingOrderResult.user_id !== userId) {
    throw new Error('權限不足');
  }
  
  if (![0, 1].includes(pendingOrderResult.status)) {
    throw new Error('狀態錯誤');
  }

  const orderCount = await database.Order.count({
    where: {
      pending_order_id: pendingOrderId,
      status: {
        [Op.in]: [0, 1],
      },
    }
  });

  if (orderCount !== 0) {
    throw new Error('尚有交易進行中');
  }

  await pendingOrderResult.destroy();
};

module.exports.DEFAULT_PENDINGORDER_SCHEMA = DEFAULT_PENDINGORDER_SCHEMA;
module.exports.getAllPendingOrders = getAllPendingOrders;
module.exports.getPendingOrders = getPendingOrders;
module.exports.getPendingOrder = getPendingOrder;
module.exports.createPendingOrder = createPendingOrder;
module.exports.lockPendingOrder = lockPendingOrder;
module.exports.unlockPendingOrder = unlockPendingOrder;
module.exports.deletePendingOrder = deletePendingOrder;
