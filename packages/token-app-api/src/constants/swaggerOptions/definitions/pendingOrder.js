const BasicPendingOrder = {
  required: [],
  properties: {
    bankcardId: {
      type: "integer",
      require: true,
      default: 0,
      description: "收款的銀行卡 ID",
    },
    isSplit: {
      type: "boolean",
      require: true,
      default: true,
      description: "是否可以拆單",
    },
    type: {
      type: "integer",
      require: true,
      default: 0,
      description: "類型: 0: 買幣, 1: 賣幣",
      enum: [0, 1],
    },
    status: {
      type: "integer",
      require: true,
      default: 0,
      description: "掛單狀態: 0: 掛賣中, 1: 已暫停掛賣, 2: 以取消掛單",
      enum: [0, 1, 2, 3],
    },
    amount: {
      type: "number",
      require: true,
      default: 100,
      description: "這筆訂單的販賣(購買)數量e",
    },
    minAmount: {
      type: "number",
      require: true,
      default: 100,
      description: "交易最小額度",
    },
    balance: {
      type: "number",
      require: true,
      default: 100,
      description: "此交易剩餘額度",
    },
    transactionMinutes: {
      type: "number",
      require: true,
      default: 15,
      description: "每筆交易的限制時間",
    },
  },
};

module.exports = {
  CreatePendingOrder: {
    properties: {
      ...BasicPendingOrder.properties,
      transactionCode: {
        type: 'string',
        description: '交易密碼: 6-20位英數混合字',
        require: true,
        default: 'a123456'
      },
      isSplit: undefined,
      status: undefined,
      balance: undefined,
    },
  },
  UserPendingOrder: {
    properties: {
      id: {
        type: "string",
        default: "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
        description: "訂單 Id",
      },
      ...BasicPendingOrder.properties,
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '交易 Id',
            default: "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
          },
          name: {
            type: 'string',
            description: '使用者名稱',
            default: "simon",
          },
        },
      },
      bankcardId: undefined,
      bankcard: {
        type: "object",
        $ref: "#/definitions/Bankcard",
      },
      createdAt: {
        type: "date",
        default: "2312131312",
        description: "建立時間",
      },
      cancelAmount: {
        type: 'number',
        description: '取消的金額數量',
        default: 0,
      },
      doneAmount: {
        type: 'number',
        description: '完成的金額數量',
        default: 0,
      },
      processAmount: {
        type: 'number',
        description: '交易中的金額數量',
        default: 0,
      },
      processCount: {
        type: 'number',
        description: '交易中的訂單數量',
        default: 0,
      },
      doneCount: {
        type: 'number',
        description: '交易完成的訂單數量',
        default: 0,
      },
      cancelCount: {
        type: 'number',
        description: '交易取消的訂單數量',
        default: 0,
      },
    },
  },  
  UserPendingOrders: {
    type: "array",
    items: {
      type: "object",
      $ref: "#/definitions/UserPendingOrder",
    },
  },
  PendingOrder: {
    properties: {
      id: {
        type: "string",
        default: "bd1c7b9e-700b-469d-999c-ebd7de4c0f42",
        description: "訂單 Id",
      },
      ...BasicPendingOrder.properties,
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: '交易 Id',
            default: "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
          },
          name: {
            type: 'string',
            description: '使用者名稱',
            default: "simon",
          },
        },
      },
      bankcardId: undefined,
      bankcard: {
        type: "object",
        $ref: "#/definitions/Bankcard",
      },
      createdAt: {
        type: "date",
        default: "2312131312",
        description: "建立時間",
      },
    },
  },
  PendingOrders: {
    type: "array",
    items: {
      type: "object",
      $ref: "#/definitions/PendingOrder",
    },
  },
};
