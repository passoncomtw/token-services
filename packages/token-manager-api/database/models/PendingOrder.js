const baseSchema = require("../schemas/baseSchema");
const { v4: uuid } = require('uuid');

module.exports = (sequelize, DataTypes) => {
  const PendingOrder = sequelize.define("PendingOrder", 
    {
      ...baseSchema,
      isSplit: {
        field: 'is_split',
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: '是非可以拆單, 如果不能拆單則 minAmount === amount',
      },
      type: {
        field: 'type',
        type: DataTypes.ENUM([0, 1]),
        allowNull: false,
        comment: '掛單類型: 0: 買幣, 1: 賣幣',
        get() {
          const rawValue = this.getDataValue('type');
          return parseInt(rawValue);
        },
      },
      status: {
        field: 'status',
        type: DataTypes.ENUM([0, 1, 2, 3]),
        defaultValue: 0,
        comment: '掛單狀態: 0: 掛賣中, 1: 已暫停掛賣, 2: 已取消掛單, 3: 已刪除掛單',
        get() {
          const rawValue = this.getDataValue('status');
          return parseInt(rawValue);
        },
      },
      telegram: {
        field: 'telegram',
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Telegram ID',
      },
      contactor: {
        filed: 'contactor',
        type: DataTypes.STRING,
        allowNull: false,
        length: 50,
      },
      transactionMinutes: {
        filed: 'transaction_minutes',
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '交易時間',
        get() {
          const rawValue = this.getDataValue('transactionMinutes');
          return parseInt(rawValue);
        },
      },
      amount: {
        filed: 'amount',
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '掛單的量',
        get() {
          const rawValue = this.getDataValue('amount');
          return Number(rawValue);
        },
      },
      processAmount: {
        filed: 'process_amount',
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '0: 購買, 1: 販賣 進行交易的數量',
        get() {
          const rawValue = this.getDataValue('processAmount');
          return Number(rawValue);
        },
      },
      minAmount: {
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '交易最小值',
        defaultValue: 100,
        get() {
          const rawValue = this.getDataValue('minAmount');
          return Number(rawValue);
        },
      },
      balance: {
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '可交易餘額',
        get() {
          const rawValue = this.getDataValue('balance');
          return Number(rawValue);
        },
      },
      cancelAmount: {
        filed: 'cancel_amount',
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '販賣 取消的數量',
        get() {
          const rawValue = this.getDataValue('cancelAmount');
          return Number(rawValue);
        },
      },
      doneAmount: {
        filed: 'done_amount',
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '交易成功的數量',
        get() {
          const rawValue = this.getDataValue('doneAmount');
          return Number(rawValue);
        },
      },
      processAmount: {
        filed: 'process_amount',
        type: DataTypes.DECIMAL(18, 0),
        allowNull: false,
        comment: '交易中的數量',
        get() {
          const rawValue = this.getDataValue('processAmount');
          return Number(rawValue);
        },
      },
      processCount: {
        filed: 'process_count',
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '0: 購買, 1: 販賣 進行交易的次數',
        get() {
          const rawValue = this.getDataValue('processCount');
          return Number(rawValue);
        },
      },
      doneCount: {
        filed: 'done_count',
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '0: 購買, 1: 販賣 交易成功的次數',
        get() {
          const rawValue = this.getDataValue('doneCount');
          return Number(rawValue);
        },
      },
      cancelCount: {
        filed: 'cancel_count',
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: '0: 購買, 1: 販賣 交易失敗的次數',
        get() {
          const rawValue = this.getDataValue('cancelCount');
          return Number(rawValue);
        },
      },
  }, {
    sequelize,
    tableName: "pending_orders",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
    paranoid: true,
  });

  PendingOrder.beforeCreate(pendingOrder => {
    const pendingOrderId = uuid();
    pendingOrder.id = pendingOrderId.replace('-', '');
  });

  PendingOrder.associate = function (models) {
    // associations can be defined here
    PendingOrder.belongsTo(models.User, {
      as: "user",
      foreignKey: {
        name: "user_id",
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    PendingOrder.belongsTo(models.Bankcard, {
      as: "bankcard",
      foreignKey: {
        name: "bank_card_id",
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };
  return PendingOrder;
};
