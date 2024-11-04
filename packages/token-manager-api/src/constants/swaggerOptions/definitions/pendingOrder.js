const BasicPendingOrder = {
  required: [],
  properties: {
    bankcardId: {
      type: 'integer',
      require: true,
      default: 0,
      description: '收款的銀行卡 ID',
    },
    type: {
      type: 'integer',
      require: true,
      default: 0,
      description: '類型: 0: 買幣, 1: 賣幣',
      enum: [0, 1],
    },
    status: {
      type: 'integer',
      require: true,
      default: 0,
      description: '訂單狀態: 0: 等待匯款, 1: 已匯款未放行, 2: 已放行, 3: 買家已取消, 4: 賣家已取消',
      enum: [0, 1, 2, 3, 4],
    },
    amount: {
      type: 'number',
      require: true,
      default: 100,
      description: '這筆訂單的販賣(購買)數量e',
    },
    minAmount: {
      type: 'number',
      require: true,
      default: 100,
      description: '交易最小額度',
    },
    balance: {
      type: 'number',
      require: true,
      default: 100,
      description: '此交易剩餘額度',
    },
    transactionMinutes: {
      type: 'number',
      require: true,
      default: 15,
      description: '每筆交易的限制時間',
    },
  },
};

module.exports = {
  PendingOrder: {
    properties: {
      id: {
        type: 'string',
        default: "30dae9a8-a9ee-43f2-8df5-3b5d2110f04b",
        description: '訂單 Id',
      },
      ...BasicPendingOrder.properties,
      user: {
        type: 'object',
        $ref: '#/definitions/User',
      },
      bankcardId: undefined,
      bankcard: {
        type: 'object',
        $ref: '#/definitions/Bankcard',
      },
      createAt: {
        type: 'date',
        default: '2312131312',
        description: '建立時間',
      },
      cancelAmount: {
        type: 'number',
        description: '取消的數量'
      },
      processAmount: {
        type: 'number',
        description: '進行中的數量'
      },
      doneAmount: {
        type: 'number',
        description: '完成的數量'
      },
      cancelCount: {
        type: 'number',
        description: '取消的次數'
      },
      doneCount: {
        type: 'number',
        description: '完成的次數'
      },
      processCount: {
        type: 'number',
        description: '進行中的次數'
      },
    },
  },
  PendingOrders: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/PendingOrder',
    },
  },
};
