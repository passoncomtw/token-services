const database = require('../database/models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const pick = require('lodash/pick');
const isEmpty = require('lodash/isEmpty');
const isNull = require('lodash/isNull');
const { getPaginationQuery } = require('../helpers/utils');

const parseBackendUserResponse = (backenduser) => {
  const filterBackenduser = pick(backenduser, [
    'id',
    'status',
    'account',
    'name',
    'createdAt',
    'backendactor',
  ]);
  return filterBackenduser;
};

const getBackendUsers = async (query = {}) => {
  const { account, name, status = null, page = 1, size = 10 } = query;
  const { offset, limit } = getPaginationQuery(page, size);

  const whereCondition = {};

  if(!isEmpty(account)) {
    whereCondition.account = {
      [Op.like]: `%${account}%`
    };
  }

  if(!isEmpty(name)) {
    whereCondition.name = {
      [Op.like]: `%${name}%`
    };
  }

  if(!isNull(status)) {
    whereCondition.status = status;
  }

  const {count, rows} = await database.Backenduser.findAndCountAll({    
    include: [{
      as: 'backendactor',
      model: database.Backendactor,
      required: true,
      attributes: [
        'id',
        'markup',
        'name',
      ],
    }],
    attributes: [
      'id',
      'account',
      'status',
      'name',
      'createdAt',
    ],
    where: whereCondition,
    limit,
    offset,
  });

  return {
    count,
    rows: rows.map(backendUser => {
      return {
        ...backendUser.toJSON(),
        roleList: [backendUser.backendactor.id],
      };
    })
  };
};

const getBackendUser = async (userId) => {
  const backenduser = await database.Backenduser.findOne({
    attributes: [
      'id',
      'account',
      'name',
      'createdAt',
    ],
    include: [{
      as: 'backendactor',
      model: database.Backendactor,
      required: true,
      attributes: [
        'id',
        'markup',
        'name',
        'permissions',
      ],
    }],
    where: {
      id: userId,
    },
  });

  return backenduser;
};

module.exports.createBackendUser = async (userId, body) => {
  const actorIds = body.actors.map(actor => actor.id);
  const existBackenduser = await database.Backenduser.findOne({
    where: { account: body.account },
  })
  const existActors = await database.Backendactor.findAll({
    where: {id: actorIds},
  });

  if(existBackenduser) {
    throw new Error('帳號已經存在');
  }

  if (existActors.lengtn === 0) {
    throw new Error('沒有角色存在');
  }

  return await database.sequelize.transaction(async t => {
    const newBackenduserResult = await database.Backenduser.create({
      name: body.name,
      account: body.account,
      password: `${body.account}${body.password}`,
    }, { transaction: t });

    const mappingPromises = existActors.map(actor => {
      return newBackenduserResult.addBackendactor(actor, { transaction: t });
    });

    await Promise.all(mappingPromises);
    return newBackenduserResult;
  });


};

module.exports.updateUserNotificationToken = async (userId, notificationToken) => {
  const userResult = await database.User.findOne({
    attributes: [
      'id',
      'notificationToken',
    ],
    where: {
      id: userId,
    },
  });

  userResult.notificationToken = notificationToken;
  await userResult.save();
};

const getBackendUserWithPasswordBy = async (account) => {
  console.log("🚀 ~ getBackendUserWithPasswordBy ~ database.Backenduser:", database.Backenduser)

  const backendUserResult = await database.Backenduser.findOne({
    include: [{
      as: 'backendactor',
      model: database.Backendactor,
      required: true,
      attributes: [
        'id',
        'markup',
        'name',
        'permissions',
      ],
    }],
    where: {
      account,
    },
  });

  return backendUserResult;
};

const updateBackendUser = async (backendUserId, body) => {
  const backenduserResult = await database.Backenduser.findOne({
    where: { id: backendUserId },
  });

  if (!backenduserResult) {
    throw new Error('後台使用者不存在');
  }

  backenduserResult.account = body.account;
  backenduserResult.name = body.name;

  if ([0, 1].includes(body.status)) {
    backenduserResult.status = body.status;
  }

  await backenduserResult.save();
};

const deleteBackendUser = async (backendUserId) => {
  const backenduserResult = await database.Backenduser.findOne({
    where: { id: backendUserId },
  });

  if (!backenduserResult) {
    throw new Error('後台使用者不存在');
  }

  if (backenduserResult.account === 'admin') {
    throw new Error('權限不足');
  }
  await backenduserResult.destroy();
};

module.exports.getBackendUser = getBackendUser;
module.exports.getBackendUsers = getBackendUsers;
module.exports.getBackendUserWithPasswordBy = getBackendUserWithPasswordBy;
module.exports.updateBackendUser = updateBackendUser;
module.exports.parseBackendUserResponse = parseBackendUserResponse;
module.exports.deleteBackendUser = deleteBackendUser;
