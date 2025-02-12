const database = require("../database/models");
const isEmpty = require("lodash/isEmpty");
const addMinutes = require("date-fns/addMinutes");
const { updateWalletFromUserId } = require("./walletServices");
const {
  getPendingOrder,
  DEFAULT_PENDINGORDER_SCHEMA,
} = require("./pendingOrderServices");
const {
  getUserWithPasswordBy,
  getUser,
  updateUser,
} = require("./userServices");
const { validateTransactionCode } = require("../helpers/passportManager");
const { getBankcard } = require("./bankcardServices");
const { getPaginationQuery } = require("../helpers/utils");

const DEFAULT_ORDER_SCHEMA = {
  include: [
    {
      as: "user",
      model: database.User,
      required: true,
      attributes: ["id", "name"],
    },
    {
      as: "bankcard",
      model: database.Bankcard,
      required: true,
      include: [
        {
          as: "bank",
          model: database.Bank,
          attributes: ["id", "bankName", "bankCode"],
        },
      ],
      attributes: [
        "id",
        "createdAt",
        "name",
        "cardNumber",
        "branchName",
        "status",
      ],
    },
    {
      as: "pendingOrder",
      model: database.PendingOrder,
      required: true,
      ...DEFAULT_PENDINGORDER_SCHEMA,
    },
  ],
  attributes: [
    "id",
    "status",
    "amount",
    "cancelReason",
    "finishAt",
    "createdAt",
  ],
};

const getOrders = async (
  { whereCondition, pendingOrderWhereCondition },
  query
) => {
  const { page = 1, size = 10 } = query;
  const { offset, limit } = getPaginationQuery(page, size);
  const ordersResult = await database.Order.findAndCountAll({
    include: [
      {
        as: "user",
        model: database.User,
        required: true,
        attributes: ["id", "name"],
      },
      {
        as: "bankcard",
        model: database.Bankcard,
        required: true,
        include: [
          {
            as: "bank",
            model: database.Bank,
            attributes: ["id", "bankName", "bankCode"],
          },
        ],
        attributes: [
          "id",
          "createdAt",
          "name",
          "cardNumber",
          "branchName",
          "status",
        ],
      },
      {
        as: "pendingOrder",
        model: database.PendingOrder,
        required: true,
        where: pendingOrderWhereCondition,
        ...DEFAULT_PENDINGORDER_SCHEMA,
      },
    ],
    attributes: [
      "id",
      "status",
      "amount",
      "cancelReason",
      "finishAt",
      "createdAt",
    ],
    offset,
    limit,
    where: whereCondition,
  });

  return ordersResult;
};

const getOrdersByUserId = async (userId, query) => {
  const { page = 1, size = 10 } = query;
  const { offset, limit } = getPaginationQuery(page, size);
  const ordersResult = await database.Order.findAndCountAll({
    ...DEFAULT_ORDER_SCHEMA,
    offset,
    limit,
    where: { user_id: userId },
  });

  return ordersResult;
};

const getOrder = async (whereCondition) => {
  const ordersResult = await database.Order.findOne({
    ...DEFAULT_ORDER_SCHEMA,
    where: whereCondition,
  });

  return ordersResult;
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
  const transaction = await database.sequelize.transaction();
  try {
    const pendingOrderUserWallet = await database.Wallet.findOne({
      include: [
        {
          as: "user",
          model: database.User,
          required: true,
          attributes: ["id"],
        },
      ],
      where: { user_id: pendingOrderResult.user.id },
    });

    const pendingOrderFreezeBalanceAmount =
      pendingOrderUserWallet.freezeBalance - orderResult.amount;
    const pendingOrderUserWalletUsefulBalance =
      pendingOrderUserWallet.usefulBalance + orderResult.amount;

    const pendingOrderUserwalletPromise = database.Wallet.update(
      {
        balance: pendingOrderUserWalletUsefulBalance,
        freezeBalance: pendingOrderFreezeBalanceAmount,
      },
      {
        where: { user_id: pendingOrderUserWallet.user.id },
        transaction,
      }
    );

    const orderPromise = database.Order.update(
      {
        status: 2,
      },
      {
        where: { id: orderResult.id },
        transaction,
      }
    );

    const pendingOrderPromise = database.Order.update(
      {
        processCount: pendingOrderResult.processCount - 1,
        processAmount: pendingOrderResult.processAmount - orderResult.amount,
        doneCount: pendingOrderResult.doneCount + 1,
        doneAmount: pendingOrderResult.doneAmount + orderResult.amount,
        status: 4,
      },
      {
        where: { id: pendingOrderResult.id },
        transaction,
      }
      );

    await Promise.all([
      orderPromise,
      pendingOrderPromise,
      pendingOrderUserwalletPromise,
    ]);

    transaction.commit();
  } catch (error) {
    transaction.rollback();
    throw error;
  }
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

  const transaction = await database.sequelize.transaction();
  try {
    const pendingOrderUserWallet = await database.Wallet.findOne({
      include: [
        {
          as: "user",
          model: database.User,
          required: true,
          attributes: ["id"],
        },
      ],
      where: { user_id: pendingOrderResult.user.id },
    });

    const pendingOrderUserWalletFreezeBalance =
      pendingOrderUserWallet.freezeBalance - orderResult.amount;
    const pendingOrderUserWalletUsefulBalance =
      pendingOrderUserWallet.usefulBalance + orderResult.amount;

    const orderUserwalletPromise = database.Wallet.update(
      {
        usefulBalance: pendingOrderUserWalletUsefulBalance,
        freezeBalance: pendingOrderUserWalletFreezeBalance,
      },
      {
        where: { user_id: pendingOrderUserWallet.user.id },
        transaction,
      }
    );

    const orderPromise = database.Order.update(
      {
        status: 2,
      },
      {
        where: { id: orderResult.id },
        transaction,
      }
    );

    const pendingOrderPromise = database.Order.update(
      {
        processCount: pendingOrderResult.processCount - 1,
        processAmount: pendingOrderResult.processAmount - orderResult.amount,
        doneCount: pendingOrderResult.doneCount + 1,
        doneAmount: pendingOrderResult.doneAmount + orderResult.amount,
      },
      {
        where: { id: pendingOrderResult.id },
        transaction,
      }
    );

    await Promise.all([
      orderPromise,
      pendingOrderPromise,
      orderUserwalletPromise,
    ]);

    transaction.commit();
  } catch (error) {
    transaction.rollback();
    throw error;
  }
};

const createOrderBySellDollarOrder = async (
  userResult,
  bankcardResult,
  pendingOrderResult,
  amount
) => {
  const pendingOrderWalletResult = await database.Wallet.findOne({
    where: { user_id: pendingOrderResult.user.id },
  });

  const transaction = await database.sequelize.transaction();
  try {
    const newProcessCount = pendingOrderResult.processCount + 1;
    const newProcessAmount = pendingOrderResult.processAmount + amount;
    const newBalance = pendingOrderResult.balance - amount;
    const walletUsefulBalance = pendingOrderWalletResult.usefulBalance - amount;
    const walletFreezeBalance = pendingOrderWalletResult.freezeBalance + amount;

    const orderPromise = database.Order.create(
      {
        amount,
        pending_order_id: pendingOrderResult.id,
        user_id: userResult.id,
        bank_card_id: bankcardResult.id,
        expectedFinishAt: addMinutes(new Date(), pendingOrderResult.transactionMinutes),
      },
      { transaction }
    );

    const walletPromise = database.Wallet.update(
      {
        usefulBalance: walletUsefulBalance,
        freezeBalance: walletFreezeBalance,
      },
      {
        where: { user_id: pendingOrderResult.user.id },
        transaction
      }
    );

    const pendingOrderPromise = database.PendingOrder.update(
      {
        processCount: newProcessCount,
        processAmount: newProcessAmount,
        balance: newBalance,
      },
      {
        where: {
          id: pendingOrderResult.id,
        },
        transaction
      },
    );

    const [newOrderResult] = await Promise.all([
      orderPromise,
      walletPromise,
      pendingOrderPromise,
    ]);

    await transaction.commit();
    return newOrderResult;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createOrderByBuyDollarOrder = async (
  userResult,
  bankcardResult,
  pendingOrderResult,
  amount
) => {
  return await database.sequelize.transaction(async (t) => {
    const newProcessCount = pendingOrderResult.processCount + 1;
    const newProcessAmount = pendingOrderResult.processAmount + amount;
    const newBalance = pendingOrderResult.balance - amount;

    const walletUsefulBalance = userResult.wallet.usefulBalance - amount;
    const walletFreezeBalance = userResult.wallet.freezeBalance + amount;

    const orderPromise = database.Order.create(
      {
        amount,
        pending_order_id: pendingOrderResult.id,
        user_id: userResult.id,
        bank_card_id: bankcardResult.id,
        expectedFinishAt: addMinutes(
          new Date(),
          pendingOrderResult.transactionMinutes
        ),
      },
      { transaction: t }
    );

    const walletPromise = database.Wallet.update(
      {
        usefulBalance: walletUsefulBalance,
        freezeBalance: walletFreezeBalance,
      },
      {
        where: { user_id: userResult.id },
      },
      { transaction: t }
    );

    const pendingOrderPromise = database.PendingOrder.update(
      {
        processCount: newProcessCount,
        processAmount: newProcessAmount,
        balance: newBalance,
      },
      {
        where: {
          id: pendingOrderResult.id,
        },
      },
      { transaction: t }
    );

    const [newOrderResult] = await Promise.all([
      orderPromise,
      pendingOrderPromise,
    ]);

    return newOrderResult;
  });
};

const getOrderStatus = (userId, orderResult, pendingOrderResult) => {
  const type = pendingOrderResult.type;
  if (type === 0) {
    if (userId === orderResult.user.id) {
      return 4;
    } else {
      return 3;
    }
  } else {
    if (userId === orderResult.user.id) {
      return 3;
    } else {
      return 4;
    }
  }
};

const updateOrderRejectStatus = async (userId, orderId, body) => {
  const userResult = await getUser(userId);
  const orderResult = await getOrder({ id: orderId });

  if (!userResult) {
    throw new Error("使用者不存在");
  }

  if (!orderResult) {
    throw new Error("訂單不存在");
  }

  const pendingOrderResult = await getPendingOrder(
    orderResult.pendingOrder.id,
    ["processCount", "processAmount", "cancelCount", "cancelAmount"]
  );

  if (![0, 1].includes(orderResult.status)) {
    throw new Error("狀態錯誤");
  }

  const amount = orderResult.amount;
  const newProcessCount = pendingOrderResult.processCount - 1;
  const newProcessAmount = pendingOrderResult.processAmount - amount;
  const newBalance = pendingOrderResult.balance + amount;
  const newCancelCount = pendingOrderResult.cancelCount + 1;
  const newCancelAmount = pendingOrderResult.cancelAmount + amount;

  const orderUserWallet = await database.Wallet.findOne({
    where: { user_id: orderResult.user.id },
  });
  const pendingOrderUserWallet = await database.Wallet.findOne({
    where: { user_id: pendingOrderResult.user.id },
  });

  return await database.sequelize.transaction(async (t) => {
    const orderPromise = database.Order.update(
      {
        cancelReason: body.cancelReason,
        status: getOrderStatus(userId, orderResult, pendingOrderResult),
      },
      {
        where: { id: orderResult.id },
        transaction: t,
      }
    );

    const pendingOrderPromise = database.PendingOrder.update(
      {
        processCount: newProcessCount,
        processAmount: newProcessAmount,
        cancelCount: newCancelCount,
        cancelAmount: newCancelAmount,
        balance: newBalance,
      },
      {
        where: {
          id: pendingOrderResult.id,
        },
        transaction: t,
      }
    );

    let userWalletPromise = null;
    if (pendingOrderResult.type === 0) {
      const newUsefulBalance = orderUserWallet.usefulBalance + amount;
      const newFreezeBalance = orderUserWallet.freezeBalance - amount;

      userWalletPromise = database.Wallet.update(
        {
          freezeBalance: newFreezeBalance,
          usefulBalance: newUsefulBalance,
        },
        {
          where: { user_id: orderResult.user.id },
          transaction: t,
        }
      );
    } else {
      const newUsefulBalance = pendingOrderUserWallet.usefulBalance + amount;
      const newFreezeBalance = pendingOrderUserWallet.freezeBalance - amount;

      userWalletPromise = database.Wallet.update(
        {
          freezeBalance: newFreezeBalance,
          usefulBalance: newUsefulBalance,
        },
        {
          where: { user_id: pendingOrderResult.user.id },
          transaction: t,
        }
      );
    }

    await Promise.all([orderPromise, userWalletPromise, pendingOrderPromise]);
  });
};

const updateOrderApplyStatus = async (userId, orderId) => {
  const userResult = await getUser(userId);
  const orderResult = await getOrder({ id: orderId });
  const pendingOrderResult = orderResult.pendingOrder;
  const isBuyingOrder = pendingOrderResult.type === 0;

  if (!userResult) {
    throw new Error("使用者不存在");
  }

  if (!orderResult) {
    throw new Error("訂單不存在");
  }

  if (isBuyingOrder) {
    if (userResult.id === pendingOrderResult.user.id) {
      throw new Error("權限不足");
    }
  }

  if (orderResult.status !== 1) {
    throw new Error("狀態錯誤");
  }

  if (isBuyingOrder) {
    await applyBuyDollarOrder(orderResult, pendingOrderResult);
  } else {
    await applySellDollarOrder(orderResult, pendingOrderResult);
  }
  return orderResult;
};

const updateOrderPaidStatus = async (userId, orderId) => {
  const userResult = await getUserWithPasswordBy({ id: userId });
  const orderResult = await getOrder({ id: orderId });
  const pendingOrderResult = orderResult.pendingOrder;
  const isBuyingOrder = pendingOrderResult.type === 0;

  if (!userResult) {
    throw new Error("使用者不存在");
  }

  if (!orderResult) {
    throw new Error("訂單不存在");
  }

  if (isBuyingOrder) {
    if (userResult.id !== pendingOrderResult.user.id) {
      throw new Error("權限不足，使用者錯誤");
    }
  }

  if (orderResult.status !== 0) {
    throw new Error("狀態錯誤");
  }

  const pendingOrderUserResult = await getUserWithPasswordBy({ id: pendingOrderResult.user.id });
  const orderUserResult = await getUserWithPasswordBy({ id: orderResult.user.id });

  if (isBuyingOrder) {
    const transaction = await database.sequelize.transaction();
    const userWalletFreezeBalance =
      orderUserResult.wallet.freezeBalance - orderResult.amount;
    const pendingOrderUserWalletFreezeBalance = pendingOrderUserResult.wallet.freezeBalance + orderResult.amount;

    try {
      await updateWalletFromUserId(
        pendingOrderResult.user.id,
        {
          freezeBalance: pendingOrderUserWalletFreezeBalance,
        },
        transaction,
      );

      await updateWalletFromUserId(
        orderResult.user.id,
        {
          freezeBalance: userWalletFreezeBalance,
        },
        transaction,
      );

      await database.Order.update(
        { status: 1, },
        {
          where: { id: orderResult.id, },
          transaction,
        }
      );
      
      await database.PendingOrder.update(
        {
          processCount: pendingOrderResult.processCount - 1,
          processAmount: pendingOrderResult.processAmount - orderResult.amount,
          doneAmount: pendingOrderResult.processAmount + orderResult.amount,
          doneCount: pendingOrderResult.doneCount + 1,
          status: 4,
        },
        {
          where: { id: pendingOrderResult.id},
          transaction,
        },
      );
      await transaction.commit();
      return getOrder({ id: orderId });
    } catch (error) {

      await transaction.rollback();
      throw error;
    }
  }

  const transaction = await database.sequelize.transaction();
  try {
    const pendingOrderUserWalletFreezeBalance = pendingOrderUserResult.wallet.freezeBalance - orderResult.amount;
    const userWalletFreezeBalance = userResult.wallet.freezeBalance + orderResult.amount;

    const pendingOrderProcessAmount = pendingOrderResult.processAmount + orderResult.amount;
    const pendingOrderProcessCount = pendingOrderResult.processCount + 1;
    const pendingOrderBalanceAmount = pendingOrderResult.balance - orderResult.amount;

    await updateWalletFromUserId(
      pendingOrderResult.user.id,
      {
        freezeBalance: pendingOrderUserWalletFreezeBalance,
      },
      transaction,
    );

    await updateWalletFromUserId(
      userResult.id,
      {
        freezeBalance: userWalletFreezeBalance,
      },
      transaction
    );

    await database.Order.update(
      { status: 1 },
      {
        where: { id: orderResult.id },
        transaction,
      },
    );

    await database.PendingOrder.update(
      {
        balance: pendingOrderBalanceAmount,
        processAmount: pendingOrderProcessAmount,
        processCount: pendingOrderProcessCount,
        status: 4,
      },
      {
        where: {
          id: pendingOrderResult.id
        },
        transaction,
      }
    );
    await transaction.commit();

    return getOrder({ id: orderId });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const createOrder = async (userId, body) => {
  const existOrder = await getOrder({
    user_id: userId,
    pending_order_id: body.orderId,
    status: [0, 1],
  });

  if (existOrder) {
    throw new Error("尚有未結束的訂單");
  }

  const userResult = await getUserWithPasswordBy({ id: userId });
  const pendingOrderResult = await getPendingOrder(body.orderId, [
    "processCount",
    "processAmount",
  ]);
  const bankcardResult = await getBankcard({
    id: body.beneficiaryBankcardId,
    user_id: userId,
  });

  if (isEmpty(bankcardResult)) {
    throw new Error("銀行卡不存在");
  }

  if (isEmpty(userResult)) {
    throw new Error("使用者不存在");
  }

  if (isEmpty(pendingOrderResult)) {
    throw new Error("掛單不存在");
  }

  if (pendingOrderResult.status !== 0) {
    throw new Error("掛單非掛賣");
  }

  if (pendingOrderResult.user.id === userId) {
    throw new Error("建立訂單與掛單擁有者不能相同");
  }

  if (userResult.wallet.status === 0) {
    throw new Error("使用者錢包凍結中");
  }

  if (!validateTransactionCode(userResult, body.transactionCode)) {
    throw new Error("交易密碼錯誤");
  }

  if (pendingOrderResult.balance < body.amount) {
    throw new Error("掛單餘額不足");
  }

  if (pendingOrderResult.isSplit) {
    if (pendingOrderResult.minAmount > body.amount) {
      throw new Error("低於最低交易額度");
    }

    const balance = pendingOrderResult.balance - body.amount;

    if (balance !== 0) {
      if (balance < 0 || balance < pendingOrderResult.minAmount) {
        throw new Error("餘額不足最低交易額度");
      }
    }
  } else {
    if (pendingOrderResult.balance !== body.amount) {
      throw new Error("此單必須一次性全部交易");
    }
  }

  if (pendingOrderResult.type === 0) {
    if (userResult.wallet.usefulBalance < body.amount) {
      throw new Error("使用者餘額不足");
    }
  }

  if (pendingOrderResult.type === 0) {
    return await createOrderByBuyDollarOrder(
      userResult,
      bankcardResult,
      pendingOrderResult,
      body.amount
    );
  } else {
    return await createOrderBySellDollarOrder(
      userResult,
      bankcardResult,
      pendingOrderResult,
      body.amount
    );
  }
};

module.exports.getOrder = getOrder;
module.exports.getOrders = getOrders;
module.exports.getOrdersByUserId = getOrdersByUserId;
module.exports.createOrder = createOrder;
module.exports.updateOrderPaidStatus = updateOrderPaidStatus;
module.exports.updateOrderApplyStatus = updateOrderApplyStatus;
module.exports.updateOrderRejectStatus = updateOrderRejectStatus;
