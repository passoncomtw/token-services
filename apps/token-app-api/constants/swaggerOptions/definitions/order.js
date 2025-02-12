const BasicOrder = {
  required: [],
  properties: {
    status: {
      type: 'integer',
      default: 0,
      description: '交易狀態',
      enum: ['0: 等待匯款', '1: 已匯款未放行', '2: 已放行', '3: 買家已取消', '4: 賣家已取消'],
    },
    amount: {
      type: 'number',
      default: 100,
      description: '交易額度'
    },
    cancelReason: {
      type: 'string',
      default: null,
      description: '取消理由'
    },
    finishAt: {
      type: 'date',
      default: '12312313',
      description: '預計過期時間',
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
        type: 'string',
        description: '掛單 Id',
        uniqueItems: true,
        default: "76690007-53b7-4228-89cb-b388df9fcd2f",
      },
      ...BasicOrder.properties,
      status: undefined,
      finishAt: undefined,
      cancelReason: undefined,
      transactionCode: {
        type: 'string',
        description: '交易密碼: 6-20位英數混合字',
        require: true,
        default: 'a123456'
      },
    },
  },
  Order: {
    properties: {
      id: {
        type: 'string',
        description: '交易 Id',
        uniqueItems: true,
        default: "c40203c4-ef8c-4a27-a794-ea3d0b530e9b",
      },
      ...BasicOrder.properties,
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
      bankcard: {
        type: 'object',
        $ref: '#/definitions/Bankcard',
      },
      pendingOrder: {
        type: 'object',
        $ref: '#/definitions/PendingOrder',
      },
      createdAt: {
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