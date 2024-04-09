'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('merchants', {
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
      telegram: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Telegram id'
      },
      contactor: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: '聯絡人',
      },
      buy_fee_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '購買的手續費類型: 0: 百分比, 1: 階梯型',
      },
      sell_fee_type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '販賣的手續費類型: 0: 百分比, 1: 階梯型',
      },
      buy_percentage_fee: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '百分比類型',
      },
      buy_ladder_fee: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '階梯型',
      },
      sell_percentage_fee: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '百分比類型',
      },
      sell_ladder_fee: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: '階梯型',
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
    return queryInterface.dropTable('merchants');
  }
};