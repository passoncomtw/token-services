'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        comment: '使用者 Id'
      },
      referral_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '使用者類型: 0: 一般使用者, 1: 商家使用者',
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '使用者類型: 0: 啟用, 1: 凍結',
      },
      transaction_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '交易狀態: 1: 可以交易, false: 凍結交易',
      },
      order_status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: '掛單狀態: 1: 允許掛單, false: 不可掛單',
      },
      login_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '登入的時間',
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: '使用者電話',
      },
      account: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '使用者帳號',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '使用者名稱',
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '使用者信箱',
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '使用者密碼',
      },
      referral_code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '推薦碼',
      },
      transaction_code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '交易密碼',
      },
      markup: {
        type: Sequelize.STRING,
        allowNull: true,
        default: "",
        comment: '註記',
      },
      notification_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('users');
  }
};