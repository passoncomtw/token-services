const crypto = require('crypto');

const { SALT_SECRET } = process.env;

const debugLog = msg => console.log(`[debug] ${msg}`);

const getPaginationQuery = (page, size = 10) => {
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

module.exports.saltHashPassword = (userpassword) => {
  const passwordData = sha512(userpassword, SALT_SECRET);
  return passwordData.passwordHash
}

module.exports.debugLog = debugLog;
module.exports.getPaginationQuery = getPaginationQuery;
