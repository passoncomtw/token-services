const crypto = require('crypto');
const isEmpty = require('lodash/isEmpty');

const { SALT_SECRET } = process.env;

const debugLog = msg => console.log(`[debug] ${msg}`);

const generateRandomString = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

const getPaginationQuery = (page, size) => {
  const offset = (page - 1) * 10;
  return { offset, limit: size };
};

const sha512 = function (password, salt) {
  const hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
  hash.update(password);
  const value = hash.digest('hex');
  return {
    salt: salt,
    passwordHash: value.toString()
  };
};

const saltHashPassword = (userpassword) => {
  const passwordData = sha512(userpassword, SALT_SECRET);
  return passwordData.passwordHash
};

const validateUserAndPassword = (user, password) => {
  if (isEmpty(user)) return { validated: false };

  const hashPassword = saltHashPassword(`${user.account}${password}`);
  if (hashPassword !== user.password) return { validated: false };

  return { validated: true };
};

module.exports.debugLog = debugLog;
module.exports.getPaginationQuery = getPaginationQuery;
module.exports.generateRandomString = generateRandomString;
module.exports.saltHashPassword = saltHashPassword;
module.exports.validateUserAndPassword = validateUserAndPassword;
