const BasicBankcard = {
  required: [],
  properties: {
    name: {
      type: 'string',
      default: '溫蒂',
      description: '銀行卡使用者名稱'
    },
    cardNumber: {
      type: 'string',
      default: '1234567890123456789',
      description: '銀行卡號'
    },
    bankId: {
      type: 'number',
      default: 1,
      description: '銀行 Id'
    },
    branchName: {
      type: 'string',
      default: '分行名稱',
      description: '支行名稱'
    },
    status: {
      type: 'integer',
      default: 0,
      description: '銀行卡狀態',
      enum: ['0: 凍結', '1: 啟用']
    },
  },
};

const BasicBank = {
  required: [],
  properties: {
    bankName: {
      type: 'string',
      default: '溫蒂',
      description: '銀行卡使用者名稱'
    },
    bankCode: {
      type: 'string',
      default: '1234567890123456789',
      description: '銀行卡號'
    },
  },
};

module.exports = {
  Bank: {
    id: {
      type: 'integer',
      default: 0,
      description: '銀行 Id'
    },
    properties: {
      ...BasicBank.properties ,
    },
  },
  Banks: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/Bank',
    },
  },
  UpdateBankcard: {
    properties: {
      ...BasicBankcard.properties,
      name: undefined,
      status: undefined,
    },
  },
  CreateBankcard: {
    properties: {
      ...BasicBankcard.properties ,
      bankId: undefined,
      bank: undefined,
    },
  },
  Bankcard: {
    properties: {
      id: {
        type: 'integer',
        default: 0,
        description: '銀行卡 Id'
      },
      createdAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間'
      },
      ...BasicBankcard.properties,
      bank: {
        type: 'object',
        $ref: '#/definitions/Bank',
      },
    },
  },
  Bankcards: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/Bankcard',
    },
  },
};