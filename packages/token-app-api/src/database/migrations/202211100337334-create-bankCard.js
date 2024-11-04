'use strict';
const userProfileSchema = require('../schemas/userProfileSchema');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('bank_cards', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      bank_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'banks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '銀行卡擁有者姓名',
      },
      card_number: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '銀行卡號',
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '銀行卡狀態: 0: 正常, 1: 停用, 2: 凍結'
      },
      branch_name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '分行名稱'
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
    return queryInterface.dropTable('bank_cards');
  }
};