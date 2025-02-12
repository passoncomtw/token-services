const { DataTypes } = require('sequelize');
const baseSchema = require('./baseSchema');

module.exports = {
  ...baseSchema,
  type: {
    field: 'type',
    type: DataTypes.ENUM([0, 1]),
    default: 0,
  },
  account: {
    filed: 'account',
    type: DataTypes.STRING,
    require: true,
    allowNull: false,
    length: 50,
  },
  password: {
    filed: 'password',
    type: DataTypes.STRING,
    require: true,
    allowNull: false,
    length: 200,
  },
  loginTime: {
    filed: 'login_time',
    type: DataTypes.DATE,
    allowNull: true,
    default: null,
    length: 20,
  },
  referralCode: {
    filed: 'referral_code',
    type: DataTypes.STRING,
    allowNull: false,
    length: 10,
  },
  transactionCode: {
    filed: 'transaction_code',
    type: DataTypes.STRING,
    allowNull: false,
    length: 10,
  },
  notificationToken: {
    field: 'notification_token',
    type: DataTypes.STRING,
    allowNull: true,
    length: 200,
  },
};
