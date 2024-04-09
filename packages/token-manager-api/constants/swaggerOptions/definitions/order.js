const BasicOrder = {
  required: [],
  properties: {
    status: {
      type: 'integer',
      default: 0,
      description: '交易狀態',
      enum: ['0: 等待匯款', '1: 已匯款未放行', '2: 已放行', '3: 買家已取消', '4: 賣家已取消'],
    },
    cancelReason: {
      type: 'string',
      default: null,
      description: '取消理由',
    },
    amount: {
      type: 'number',
      default: 100,
      description: '交易額度'
    },
    finishAt: {
      type: 'number',
      default: '12312313',
      description: '交易完成時間',
    }
  },
};
module.exports = {
  CreateOrder: {
    properties: {
      beneficiaryBankcardId: {
        type: 'integer',
        description: '買家 銀行卡 Id',
        default: 1,
      },
      orderId: {
        type: 'integer',
        description: '掛單 Id',
        uniqueItems: true,
        default: 1,
      },
      ...BasicOrder.properties,
      status: undefined,
      transactionCode: {
        type: 'string',
        description: '交易密碼',
        description: '交易密碼: 4個數字',
        require: true,
        default: 'a12345678'
      },
    },
  },
  OrderResponse: {
    properties: {
      id: {
        type: 'integer',
        description: '交易 Id',
        uniqueItems: true,
        default: 1,
      },
      createdAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間'
      },
      ...BasicOrder.properties,
      sender: {
        type: 'object',
        $ref: '#/definitions/User',
      },
      senderBankcard: {
        type: 'object',
        $ref: '#/definitions/OrderBankcardResponse',
      },
      beneficiaryBankcard: {
        type: 'object',
        $ref: '#/definitions/OrderBankcardResponse',
      },
      beneficiary: {
        properties: {
          id: {
            type: 'integer',
            description: '使用者 Id',
            uniqueItems: true,
            default: 1,
          },
          name: {
            type: 'string',
            description: '使用者 名稱',
            default: 1,
          },
          account: {
            type: 'string',
            description: '使用者 帳號',
            default: 1,
          },
        },
      },
    },
  },
  Order: {
    properties: {
      id: {
        type: 'integer',
        description: '交易 Id',
        uniqueItems: true,
        default: 1,
      },
      ...BasicOrder.properties,
      pendingOrder: {
        type: 'object',
        $ref: '#/definitions/PendingOrder',
      },
      user: {
        type: 'object',
        description: '要與掛單交易的使用者',
        properties: {
          id: {
            type: 'number',
            description: '使用者 id',
            default: 1,
          },
          name: {
            type: 'string',
            description: '使用者名稱',
            default: 'tomasdemo001',
          },
          account: {
            type: 'string',
            description: '使用者帳號',
            default: 'tomasdemo001',
          },
        },
      },
      bankcard: {
        type: 'object',
        description: '要與掛單交易的使用者使用的銀行卡',
        $ref: '#/definitions/Bankcard',
      },
      createAt: {
        type: 'date',
        default: '123132131231',
        description: '建立時間'
      },
    },
  },
  Orders: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/Order',
    },
  }
};