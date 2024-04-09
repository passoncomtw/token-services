'use strict';
const userProfileSchema = require('../schemas/userProfileSchema');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('banks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '銀行卡狀態: 0: 正常, 1: 停用, 2: 凍結'
      },
      bank_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '銀行名稱'
      },
      bank_code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '銀行代碼'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('banks');
  }
};