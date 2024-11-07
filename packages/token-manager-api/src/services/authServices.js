const database = require('../database/models');
const { isEmpty } = require('lodash');
const { validateUserAndPassword } = require('../helpers/utils');

const updateBackendUserLoginPassword = async (userId, body) => {
  const userResult = await database.Backenduser.findOne({
    where: { id: userId },
  });

  if (isEmpty(userResult)) {
    throw new Error('使用者不存在');
  }

  const { validated } = validateUserAndPassword(userResult, body.password);
      
  if (!validated) {
    throw new Error('舊密碼錯誤');
  }

  userResult.password = `${userResult.account}${body.newPassword}`;
  await userResult.save();
};

module.exports.updateBackendUserLoginPassword = updateBackendUserLoginPassword;
