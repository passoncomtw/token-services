const database = require('../database/models');
const isEmpty = require('lodash/isEmpty');

const getBackendactor = async (whereCondition) => {
  const result = await database.Backendactor.findOne({
    where: whereCondition,
  });

  return result || {};
};

const getBackendactors = async () => {
  const result = await database.Backendactor.findAndCountAll({
    where: {},
  });

  return result;
};

const createBackendactor = async (body) => {
  return await database.Backendactor.create({...body, permissions: JSON.stringify({})});
};

const updateBackendactor = async (backendactorId, body) => {
  const existActorResult = await database.Backendactor.findOne({
    attributes: ['id', 'name', 'permissions', 'markup', 'createdAt'],
    where: { id: backendactorId },
  });

  existActorResult.name = body.name;
  existActorResult.markup = body.markup;
  existActorResult.permissions = body.permissions;

  await existActorResult.save();
  return existActorResult;
};

const deleteBackendactor = async (backendactorId) => {
  if(Number(backendactorId) === 1) {
    throw new Error('預設角色不可刪除');
  }

  const existActorResult = await database.Backendactor.findOne({
    attributes: ['id'],
    where: { id: backendactorId },
  });

  if(isEmpty(existActorResult)) {
    throw new Error('角色不存在');
  }

  await existActorResult.destroy();
};

module.exports.getBackendactors = getBackendactors;
module.exports.getBackendactor = getBackendactor;
module.exports.createBackendactor = createBackendactor;
module.exports.updateBackendactor = updateBackendactor;
module.exports.deleteBackendactor = deleteBackendactor;
