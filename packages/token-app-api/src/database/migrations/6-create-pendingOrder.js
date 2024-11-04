'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('pending_orders', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        comment: '掛單 Id'
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
      bank_card_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'bank_cards',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '訂單類型: 0: 買幣, 1: 賣幣'
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '訂單狀態: 0: 等待付款, 1: 已付款等待放行, 2: 買家取消, 3: 賣家取消, 4: 已放行'
      },
      transaction_minutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '每筆交易的限制時間',
      },
      process_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '現在正在交易的訂單數量',
      },
      cancel_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '取消交易的訂單數量',
      },
      done_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '完成交易的訂單數量',
      },
      telegram: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Telegram ID',
      },
      contactor: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: '聯絡人',
      },
      min_amount: {
        type: Sequelize.DECIMAL(18, 0),
        allowNull: false,
        comment: '交易最小值'
      },
      balance: {
        type: Sequelize.DECIMAL(18, 0),
        allowNull: false,
        comment: '剩餘額度'
      },
      amount: {
        type: Sequelize.DECIMAL(18, 0),
        allowNull: false,
        comment: '掛單數量',
      },
      process_amount: {
        type: Sequelize.DECIMAL(18, 0),
        allowNull: false,
        comment: '0: 購買, 1: 販賣 進行交易的數量',
      },
      cancel_amount: {
        type: Sequelize.DECIMAL(18, 0),
        allowNull: false,
        comment: '0: 購買, 1: 販賣 取消的數量',
      },
      done_amount: {
        type: Sequelize.DECIMAL(18, 0),
        allowNull: false,
        comment: '0: 購買, 1: 販賣 交易成功的數量',
      },
      is_split: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        default: true,
        comment: '是否拆單',
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
    return queryInterface.dropTable('pending_orders');
  }
};