const baseSchema = require("../schemas/baseSchema");
const { v4: uuid } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define("Order",
    {
      ...baseSchema,
      status: {
        field: 'status',
        type: DataTypes.ENUM([0, 1, 2, 3, 4]),
        defaultValue: 0,
        comment: '訂單狀態: 0: 等待匯款, 1: 已匯款未放行, 2: 已放行, 3: 買家已取消, 4: 賣家已取消, 5: 後台取消',
        get() {
          const rawValue = this.getDataValue('status');
          return parseInt(rawValue);
        },
      },
      amount: {
        filed: 'amount',
        type: DataTypes.FLOAT,
        allowNull: false,
        comment: '進行交易的數量',
        get() {
          const rawValue = this.getDataValue('amount');
          return Number(rawValue);
        },
      },
      cancelReason: {
        filed: 'cancel_reason',
        type: DataTypes.STRING,
        allowNull: true,
        comment: '取消的原因',
      },
      expectedFinishAt: {
        filed: 'expected_finish_at',
        type: DataTypes.DATE,
        allowNull: false,
        comment: '預計完成交易的時間',
        get() {
          const rawValue = this.getDataValue('finishAt');
          return rawValue ? rawValue.getTime() : null;
        }
      },
      finishAt: {
        filed: 'finish_at',
        type: DataTypes.DATE,
        allowNull: true,
        comment: '完成交易的時間',
        get() {
          const rawValue = this.getDataValue('finishAt');
          return rawValue ? rawValue.getTime() : null;
        }
      },
    }, {
    sequelize,
    tableName: "orders",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    paranoid: true,
  });

  Order.beforeCreate(order => {
    const orderId = uuid();
    order.id = orderId.replace('-', '');
  });

  Order.associate = function (models) {
    // associations can be defined here
    Order.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: 'user_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Order.belongsTo(models.PendingOrder, {
      as: "pendingOrder",
      foreignKey: {
        name: 'pending_order_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Order.belongsTo(models.Bankcard, {
      as: "bankcard",
      foreignKey: {
        name: 'bank_card_id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };
  return Order;
};
