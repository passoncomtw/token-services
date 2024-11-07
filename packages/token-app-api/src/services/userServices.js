const database = require("../database/models");
const { v4: uuidv4 } = require("uuid");
const pick = require("lodash/pick");
const isEmpty = require("lodash/isEmpty");
const { saltHashPassword } = require("../helpers/utils");
const { QueryTypes } = require('sequelize');

const parseUserResponse = (userResult) => {
  const { wallet, referralUser } = userResult;
  const userResponse = pick(userResult, [
    "id",
    "account",
    "referralCode",
    "type",
    "createdAt",
    "name",
    "email",
  ]);

  const referral = (isEmpty(referralUser) || referralUser.id === null)
    ? null
    : pick(referralUser, ['id', 'type', 'email', 'account', 'name']);
  const walletResult = pick(wallet, ['status', 'usefulBalance', 'freezeBalance', 'guaranteedBalance']);
  return { ...userResponse, wallet: walletResult, referralUser: referral };
};

module.exports.storeValueByUserId = async (userId) => {
  const walletResult = await database.Wallet.findOne({ user_id: userId });
  walletResult.usefulBalance = walletResult.usefulBalance + 1000;
  await walletResult.save();
  return walletResult;
};

module.exports.updateUserNotificationToken = async (userId, notificationToken) => {
  const userResult = await database.User.findOne({
    attributes: [
      "id",
      "notificationToken",
    ],
    where: {
      id: userId,
    },
  });

  userResult.notificationToken = notificationToken;
  await userResult.save();
};

const getUserWithPasswordBy = async (whereCondition, options = {}) => {
  return await database.User.findOne({
    include: [{
      as: 'wallet',
      model: database.Wallet,
      required: true,
    }],
    attributes: [
      "id",
      "account",
      "transactionCode",
      "referralCode",
      "type",
      "password",
      "email",
      "name",
    ],
    ...options,
    where: whereCondition,
  });
};

const getUser = async (userId) => {
  const userResult = await database.sequelize.query(`SELECT "User"."id", "User"."type", "User"."name", "User"."email", "User"."created_at" AS "createdAt", "wallet"."id" AS "wallet.id", "wallet"."created_at" AS "wallet.createdAt", "wallet"."updated_at" AS "wallet.updatedAt", "wallet"."deleted_at" AS "wallet.deletedAt", "wallet"."status" AS "wallet.status", "wallet"."useful_balance" AS "wallet.usefulBalance", "wallet"."guaranteed_balance" AS "wallet.guaranteedBalance", "wallet"."freeze_balance" AS "wallet.freezeBalance", "wallet"."user_id" AS "wallet.user_id", "referralUser"."id" AS "referralUser.id", "referralUser"."created_at" AS "referralUser.createdAt", "referralUser"."updated_at" AS "referralUser.updatedAt", "referralUser"."deleted_at" AS "referralUser.deletedAt", "referralUser"."type" AS "referralUser.type", "referralUser"."status" AS "referralUser.status", "referralUser"."order_status" AS "referralUser.orderStatus", "referralUser"."transaction_status" AS "referralUser.transactionStatus", "referralUser"."account" AS "referralUser.account", "referralUser"."email" AS "referralUser.email", "referralUser"."name" AS "referralUser.name", "referralUser"."password" AS "referralUser.password", "referralUser"."login_time" AS "referralUser.loginTime", "referralUser"."referral_code" AS "referralUser.referralCode", "referralUser"."transaction_code" AS "referralUser.transactionCode", "referralUser"."markup" AS "referralUser.markup", "referralUser"."notification_token" AS "referralUser.notificationToken", "referralUser"."referral_id" AS "referralUser.referral_id" FROM "users" AS "User" INNER JOIN "wallets" AS "wallet" ON "User"."id" = "wallet"."user_id" LEFT OUTER JOIN "users" AS "referralUser" ON "User"."referral_id" = "referralUser"."id" WHERE "User"."id" = '${userId}'`, {
    // A function (or false) for logging your queries
    // Will get called for every SQL query that gets sent
    // to the server.
    logging: console.log,

    // If plain is true, then sequelize will only return the first
    // record of the result set. In case of false it will return all records.
    plain: true,
    nest: true,
    // Set this to true if you don't have a model definition for your query.
    raw: true,

    // The type of query you are executing. The query type affects how results are formatted before they are passed back.
    type: QueryTypes.SELECT
  })

  return userResult === null ? {} : parseUserResponse(userResult);
};

module.exports.updateUserTransactionPassword = async (userId, body) => {
  const existUser = await getUserWithPasswordBy({ id: userId });
  if (isEmpty(existUser)) {
    throw new Error("使用者不存在");
  }

  const { password, newPassword } = body;
  const hashPassword = saltHashPassword(password);
  if (hashPassword !== existUser.transactionCode) {
    throw new Error("交易密碼驗證錯誤");
  }

  existUser.transactionCode = newPassword;
  await existUser.save();
  return existUser;
};

module.exports.updateUserLoginPassword = async (userId, body) => {
  const existUser = await getUserWithPasswordBy({ id: userId });
  if (isEmpty(existUser)) {
    throw new Error("使用者不存在");
  }

  const { password, newPassword } = body;
  const hashPassword = saltHashPassword(`${existUser.account}${password}`);
  if (hashPassword !== existUser.password) {
    throw new Error("密碼驗證錯誤");
  }

  existUser.password = `${existUser.account}${newPassword}`;
  await existUser.save();
  return existUser;
};

module.exports.updateUser = async (userId, query) => {
  const existUser = await database.User.findOne({
    attributes: [
      "id",
      "type",
      "name",
      "email",
      "createdAt",
    ],
    where: {
      id: userId,
    },
  });

  if (isEmpty(existUser)) {
    throw new Error("使用者不存在");
  }

  const { name = null, email = null } = query;
  if (name !== null) {
    existUser.name = name;
  }

  if (email !== null) {
    existUser.email = email;
  }

  await existUser.save();
  return existUser;
};

const getReferral = async (referralCode) => {
  if (isEmpty(referralCode)) return null;
  const user = await database.User.findOne({
    where: {
      referralCode,
    }
  });

  if (user) return user.id;
  return null;
};

module.exports.createUser = async (userData) => {
  const { account, name, email, password, transactionCode, referralCode = null } = userData;
  const existUser = await database.User.findOne({
    where: {
      email,
    }
  });

  if (existUser) throw new Error("使用者已存在");

  return await database.sequelize.transaction(async t => {
    const referralId = await getReferral(referralCode);

    const userResult = await database.User.create({
      name,
      email,
      account,
      type: 0,
      referral_id: referralId,
      password: `${account}${password}`,
      referralCode: uuidv4().split("-")[0],
      transactionCode: transactionCode,
    }, { transaction: t });

    await database.Wallet.create({
      user_id: userResult.id,
    }, { transaction: t });

    return {
      id: userResult.id,
      createdAt: userResult.createdAt,
      ...userData
    };
  });
};

module.exports.parseUserResponse = parseUserResponse;
module.exports.getUserWithPasswordBy = getUserWithPasswordBy;
module.exports.getUser = getUser;
