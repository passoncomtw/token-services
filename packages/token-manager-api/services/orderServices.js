const database = require('../database/models');
const pick = require('lodash/pick');
const { DEFAULT_PENDINGORDER_SCHEMA } = require('./pendingorderServices');
const { getPaginationQuery } = require('../helpers/utils');

const parseOrderResponse = row => {
  const data = pick(row, ['id', 'status', 'amount', 'finishAt', 'cancelReason', 'createdAt']);
  const orderUser = row.user;
  const pendingOrderUser = row.pendingOrder.user;
  const orderBandCard = row.bankcard;
  const pendingBankCard = row.pendingOrder.bankcard;
  const { sender, beneficiary, senderBankcard, beneficiaryBankcard } = row.pendingOrder.type === 0
    ? { sender: pendingOrderUser, beneficiary: orderUser, senderBankcard: pendingBankCard, beneficiaryBankcard: orderBandCard }
    : { sender: orderUser, beneficiary: pendingOrderUser, senderBankcard: orderBandCard, beneficiaryBankcard: pendingBankCard };

  return {
    ...data,
    sender,
    beneficiary,
    senderBankcard,
    beneficiaryBankcard,
  };
};

const applySellDollarOrder = async (orderResult, pendingOrderResult) => {
  /**
     * 賣幣放行
     * 掛單建立者的錢包 freeze balance 扣除
     * 轉移到訂單建立者的錢包 useful balance
     * 訂單狀態改成 2
     * 掛單
     *   process_count - 1
     *   done_count + 1
     *   process_amount - amount
     *   done_amount + amount
     * */
  return await database.sequelize.transaction(async t => {

    const orderUserWallet = await database.Wallet.findOne({
      include: [{
        as: 'user',
        model: database.User,
        required: true,
        attributes: ["id"],
      }],
      where: { user_id: orderResult.user.id },
    });

    const pendingOrderUserWallet = await database.Wallet.findOne({
      include: [{
        as: 'user',
        model: database.User,
        required: true,
        attributes: ["id"],
      }],
      where: { user_id: pendingOrderResult.user.id },
    });

    const orderUserWalletFreezeBalance = orderUserWallet.freezeBalance + orderResult.amount;
    const pendingOrderUserWalletUsefulBalance = pendingOrderUserWallet.usefulBalance - orderResult.amount;

    const orderUserwalletPromise = database.Wallet.update({
      freezeBalance: orderUserWalletFreezeBalance,
    }, {
      where: { user_id: orderUserWallet.user.id },
      transaction: t
    });

    const pendingOrderUserwalletPromise = database.Wallet.update({
      usefulBalance: pendingOrderUserWalletUsefulBalance,
    }, {
      where: { user_id: pendingOrderUserWallet.user.id },
      transaction: t
    });

    const orderPromise = database.Order.update({
      status: 2,
    }, {
      where: { id: orderResult.id },
      transaction: t
    });

    const pendingOrderPromise = database.Order.update({
      processCount: pendingOrderResult.processCount - 1,
      processAmount: pendingOrderResult.processAmount - orderResult.amount,
      doneCount: pendingOrderResult.doneCount + 1,
      doneAmount: pendingOrderResult.doneAmount + orderResult.amount,
    }, {
      where: { id: pendingOrderResult.id },
      transaction: t
    });

    await Promise.all([
      orderPromise,
      pendingOrderPromise,
      orderUserwalletPromise,
      pendingOrderUserwalletPromise,
    ]);
  });
};

const applyBuyDollarOrder = async (orderResult, pendingOrderResult) => {
  /**
   * 買幣放行
   * 訂單建立者的錢包 freeze balance 扣除
   * 轉移到掛單建立者的錢包 useful balance
   * 訂單狀態改成 2
   * 掛單
   *   process_count - 1
   *   done_count + 1
   *   process_amount - amount
   *   done_amount + amount
   * */
  return await database.sequelize.transaction(async t => {
    const orderUserWallet = await database.Wallet.findOne({
      include: [{
        as: 'user',
        model: database.User,
        required: true,
        attributes: ["id"],
      }],
      where: { user_id: orderResult.user.id },
    });
    const pendingOrderUserWallet = await database.Wallet.findOne({
      include: [{
        as: 'user',
        model: database.User,
        required: true,
        attributes: ["id"],
      }],
      where: { user_id: pendingOrderResult.user.id },
    });

    const orderUserWalletFreezeBalance = orderUserWallet.freezeBalance - orderResult.amount;
    const pendingOrderUserWalletUsefulBalance = pendingOrderUserWallet.usefulBalance + orderResult.amount;

    const orderUserwalletPromise = database.Wallet.update({
      freezeBalance: orderUserWalletFreezeBalance,
    }, {
      where: { user_id: orderUserWallet.user.id },
      transaction: t
    });
    const pendingOrderUserwalletPromise = database.Wallet.update({
      usefulBalance: pendingOrderUserWalletUsefulBalance,
    }, {
      where: { user_id: pendingOrderUserWallet.user.id },
      transaction: t
    });

    const orderPromise = database.Order.update({
      status: 2,
    }, {
      where: { id: orderResult.id },
      transaction: t
    });

    const pendingOrderPromise = database.Order.update({
      processCount: pendingOrderResult.processCount - 1,
      processAmount: pendingOrderResult.processAmount - orderResult.amount,
      doneCount: pendingOrderResult.doneCount + 1,
      doneAmount: pendingOrderResult.doneAmount + orderResult.amount,
    }, {
      where: { id: pendingOrderResult.id },
      transaction: t
    });

    await Promise.all([
      orderPromise,
      pendingOrderPromise,
      orderUserwalletPromise,
      pendingOrderUserwalletPromise,
    ]);
  });
};

const getOrders = async ({ whereCondition, pendingOrderWhereCondition }, {page = 1, size = 10}) => {
  const { offset, limit } = getPaginationQuery(page, size);
  
  const { count, rows } = await database.Order.findAndCountAll({
    include: [{
      as: 'user',
      model: database.User,
      required: true,
      attributes: ['id', 'name', 'account'],
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
    }, {
      as: 'pendingOrder',
      model: database.PendingOrder,
      required: true,
      where: pendingOrderWhereCondition,
      ...DEFAULT_PENDINGORDER_SCHEMA,
    }],
    attributes: ['id', 'status', 'amount', 'cancelReason', 'finishAt', 'createdAt'],
    where: whereCondition,
    offset,
    limit,
  });

  return {
    count,
    rows: rows.map(parseOrderResponse),
  };
};

const finishOrder = async (orderId) => {
  const orderResult = await database.Order.findOne({
    include: [
      {
        as: 'user',
        model: database.User,
        required: true,
        include: [{
          as: 'wallet',
          model: database.Wallet,
          required: true,
        }],
      },
      {
        as: 'pendingOrder',
        model: database.PendingOrder,
        required: true,
        include: [
          {
            as: 'user',
            model: database.User,
            required: true,
            attributes: ['id', 'name'],
            include: [
              {
                as: 'wallet',
                model: database.Wallet,
                required: true,
              },
            ],
          }
        ],
      },
    ],
    where: { id: orderId },
  });

  if (!orderResult) {
    throw new Error("訂單不存在");
  }

  const userResult = orderResult.user;
  const pendingOrderResult = orderResult.pendingOrder;

  if (!userResult) {
    throw new Error("使用者不存在");
  }

  if (orderResult.status !== 1) {
    throw new Error("狀態錯誤");
  }

  if (pendingOrderResult.type === 0) {
    await applyBuyDollarOrder(orderResult, pendingOrderResult);
  } else {
    await applySellDollarOrder(orderResult, pendingOrderResult);
  }
};

const cancelOrder = async (orderId, body) => {
  const orderResult = await database.Order.findOne({
    include: [
      {
        as: 'user',
        model: database.User,
        required: true,
        include: [{
          as: 'wallet',
          model: database.Wallet,
          required: true,
        }],
      },
      {
        as: 'pendingOrder',
        model: database.PendingOrder,
        required: true,
        include: [
          {
            as: 'user',
            model: database.User,
            required: true,
            attributes: ['id', 'name'],
            include: [
              {
                as: 'wallet',
                model: database.Wallet,
                required: true,
              },
            ],
          }
        ],
      },
    ],
    where: { id: orderId },
  });

  if (!orderResult) {
    throw new Error('订单不存在');
  }

  if (![0, 1].includes(orderResult.status)) {
    throw new Error('订单状态错误');
  }

  const userResult = orderResult.user;
  const pendingOrderResult = orderResult.pendingOrder;
  const orderUserWallet = userResult.wallet;
  const pendingOrderUserWallet = pendingOrderResult.user.wallet;

  const amount = orderResult.amount;
  const newProcessCount = pendingOrderResult.processCount - 1;
  const newProcessAmount = pendingOrderResult.processAmount - amount;
  const newBalance = pendingOrderResult.balance + amount;
  const newCancelCount = pendingOrderResult.cancelCount + 1;
  const newCancelAmount = pendingOrderResult.cancelAmount + amount;

  return await database.sequelize.transaction(async t => {
    const orderPromise = database.Order.update({
      cancelReason: body.cancelReason,
      status: 5,
    }, {
      where: { id: orderResult.id },
      transaction: t,
    });

    const pendingOrderPromise = database.PendingOrder.update({
      processCount: newProcessCount,
      processAmount: newProcessAmount,
      cancelCount: newCancelCount,
      cancelAmount: newCancelAmount,
      balance: newBalance,
    }, {
      where: {
        id: pendingOrderResult.id,
      },
      transaction: t,
    });

    let userWalletPromise = null;
    if (pendingOrderResult.type === 0) {
      const newUsefulBalance = orderUserWallet.usefulBalance + amount;
      const newFreezeBalance = orderUserWallet.freezeBalance - amount;

      userWalletPromise = database.Wallet.update({
        freezeBalance: newFreezeBalance,
        usefulBalance: newUsefulBalance,
      }, {
        where: { user_id: orderResult.user.id },
        transaction: t
      });
    } else {
      const newUsefulBalance = pendingOrderUserWallet.usefulBalance + amount;
      const newFreezeBalance = pendingOrderUserWallet.freezeBalance - amount;

      userWalletPromise = database.Wallet.update({
        freezeBalance: newFreezeBalance,
        usefulBalance: newUsefulBalance,
      }, {
        where: { user_id: pendingOrderResult.user.id },
        transaction: t
      });
    }

    await Promise.all([
      orderPromise,
      userWalletPromise,
      pendingOrderPromise,
    ]);
  });
};

module.exports.getOrders = getOrders;
module.exports.cancelOrder = cancelOrder;
module.exports.finishOrder = finishOrder;
