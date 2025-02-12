const database = require('../database/models');
const { Op } = require('sequelize');
const { getPaginationQuery, generateRandomString, saltHashPassword, validateUserAndPassword } = require('../helpers/utils');
const { isEmpty } = require('lodash');

const getUsers = async (whereCondition = {}, query) => {
  const { page = 1, size = 10 } = query;
  const { offset, limit } = getPaginationQuery(page, size);
  const usersResult = await database.User.findAndCountAll({
    include: [{
      as: 'merchant',
      model: database.Merchant,
      required: false,
      attributes: ['buyFeeType', 'sellFeeType', 'telegram', 'contactor', 'createdAt', 'buyPercentageFee', 'buyLadderFee', 'sellPercentageFee', 'sellLadderFee'],
    }],
    attributes: ['id', 'type', 'account', 'email', 'name', 'createdAt', 'markup', 'status', 'transactionStatus', 'orderStatus'],
    where: whereCondition,
    offset,
    limit,
  });

  return usersResult;
};

const getUserDetail = async (whereCondition) => {
  const usersResult = await database.User.findOne({
    include: [{
      as: 'merchant',
      model: database.Merchant,
      required: false,
      attributes: ['buyFeeType', 'sellFeeType', 'telegram', 'contactor', 'createdAt', 'buyPercentageFee', 'buyLadderFee', 'sellPercentageFee', 'sellLadderFee'],
    }, {
      as: 'wallet',
      model: database.Wallet,
      required: true,
      attributes: [
        'status',
        'usefulBalance',
        'guaranteedBalance',
        'createdAt',
        'freezeBalance',
      ],
    }],
    attributes: ['id', 'type', 'account', 'name', 'phone', 'email', 'createdAt', 'markup', 'status', 'transactionStatus', 'orderStatus'],
    where: whereCondition,
  });

  return usersResult;
};

const updateSelfPassword = async (userId, body) => {
  const userResult = await database.User.findOne({
    where: { id: userId },
  });

  const { validated } = validateUserAndPassword(userResult, body.password);
  if (!validated) {
    throw new Error('使用者不存在或密碼錯誤');
  }

  userResult.password = `${userResult.account}${body.newPassword}`;
  await userResult.save();
  
};

const updateUser = async (userId, body) => {
  const userResult = await database.User.findOne({
    include: [{
      as: 'merchant',
      model: database.Merchant,
      required: false,
      attributes: ['buyFeeType', 'sellFeeType', 'telegram', 'contactor', 'createdAt', 'buyPercentageFee', 'buyLadderFee', 'sellPercentageFee', 'sellLadderFee'],
    }],
    where: { id: userId }
  });

  if (!userResult) {
    throw new Error('使用者不存在');
  }

  const{ merchant } = userResult;
  const {
    type,
    name,
    email,
    status,
    orderStatus,
    transactionStatus,
    contactor,
    telegram,
    buyFeeType,
    sellFeeType,
    buyLadderFee,
    sellLadderFee,
    buyPercentageFee,
    sellPercentageFee,
  } = body;

  userResult.type = type;
  userResult.name = name;
  userResult.email = email;
  userResult.phone = phone;
  userResult.status = status;
  userResult.orderStatus = orderStatus;
  userResult.transactionStatus = transactionStatus;

  merchant.contactor = contactor;
  merchant.telegram = telegram;
  merchant.buyFeeType = buyFeeType;
  merchant.sellFeeType = sellFeeType;
  merchant.buyPercentageFee = buyPercentageFee;
  merchant.buyLadderFee = buyLadderFee;
  merchant.sellPercentageFee = sellPercentageFee;
  merchant.sellLadderFee = sellLadderFee;

  // await merchant.save();
  await userResult.save();
};

const getReferralUser = async (referrer) => {
  if (referrer) {
    return database.User.findOne({
      where: { referralCode: body.referrer },
    });
  }
  return null;
};

const createUser = async (body) => {
  const {
    type,
    account,
    name,
    email,
    password,
    transactionCode,
    ...merchantPayload
  } = body;
    console.log("🚀 ~ createUser ~ merchantPayload:", merchantPayload)
  const existUser = await database.User.findOne({
    where: {
      [Op.or]: [
        { email },
        { account },
      ]
    }
  });

  if (existUser) {
    throw new Error('使用者已存在');
  }

  return await database.sequelize.transaction(async t => {
    const referralUser = await getReferralUser(body.referrer);

    const referralUserId = isEmpty(referralUser) ? null : referralUser.id;
    const userData = {
      name,
      type,
      email,
      account,
      transactionCode,
      referral_id: referralUserId,
      password: `${account}${password}`,
      referralCode: generateRandomString(),
    };
    console.log("🚀 ~ createUser ~ userData:", userData)
    const userResult = await database.User.create(userData, { transaction: t });

    await database.Merchant.create({
      user_id: userResult.id,
      buyFeeType: 0,
      sellFeeType: 0,
      ...merchantPayload,
    }, { transaction: t });
    await database.Wallet.create({
      user_id: userResult.id,
      status: 1,
      usefulBalance: 0,
      guaranteedBalance: 0,
      freezeBalance: 0,
    }, { transaction: t });
  });
};

const unlockUser = async (userId) => {
  const userResult = await database.User.findOne({
    where: { id: userId },
  });

  if (isEmpty(userResult)) {
    throw new Error('使用者不存在');
  }

  userResult.status = 1;
  await userResult.save();

  return await getUserDetail({ id: userId });
};

const updateUserLoginPassword = async (userId, body) => {
  const userResult = await database.User.findOne({
    where: { id: userId },
  });

  if (isEmpty(userResult)) {
    throw new Error('使用者不存在');
  }

  userResult.password = `${userResult.account}${body.password}`;
  await userResult.save();
};

const updateUserTransactionPassword = async (userId, body) => {
  const userResult = await database.User.findOne({
    where: { id: userId },
  });

  if (isEmpty(userResult)) {
    throw new Error('使用者不存在');
  }

  userResult.transactionCode = body.password;
  await userResult.save();
};

module.exports.createUser = createUser;
module.exports.updateUser = updateUser;
module.exports.getUsers = getUsers;
module.exports.getUserDetail = getUserDetail;
module.exports.unlockUser = unlockUser;
module.exports.updateSelfPassword = updateSelfPassword;
module.exports.updateUserLoginPassword = updateUserLoginPassword;
module.exports.updateUserTransactionPassword = updateUserTransactionPassword;
