const BasicBankcard = {
  required: [],
  properties: {
    name: {
      type: 'string',
      default: '溫蒂',
      description: '銀行卡使用者名稱',
    },
    cardNumber: {
      type: 'string',
      default: '1234567890123456789',
      description: '銀行卡號',
    },
    branchName: {
      type: 'string',
      default: '分行名稱',
      description: '開戶支行',
    },
    status: {
      type: 'integer',
      default: 0,
      description: '銀行卡狀態',
      enum: ['0: 凍結', '1: 啟用'],
    },
    bankId: {
      type: 'number',
      default: 1,
      description: '銀行 id',
    },
    bankName: {
      type: 'string',
      default: '中國銀行',
      description: '銀行名稱',
    },
    bankCode: {
      type: 'string',
      default: 'CDD',
      description: '銀行代碼',
    },
  },
};

module.exports = {
  CreateBankcard: BasicBankcard,
  OrderBankcardResponse: {
    properties: {
      id: {
        type: 'integer',
        default: 0,
        description: '銀行卡 Id'
      },
      createAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間',
      },
      ...BasicBankcard.properties,
      bankId: undefined,
      bankName: undefined,
      bankCode: undefined,
      bank: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            default: 0,
            description: '銀行 Id'
          },
          bankName: {
            type: 'string',
            default: '中國銀行',
            description: '銀行名稱',
          },
          bankCode: {
            type: 'string',
            default: 'CDD',
            description: '銀行代碼',
          },
        },
      }
    },
  },
  BankcardResponse: {
    properties: {
      id: {
        type: 'integer',
        default: 0,
        description: '銀行卡 Id'
      },
      createAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間',
      },
      ...BasicBankcard.properties,
      account: {
        type: 'string',
        description: '使用者的帳號',
        default: 'wendy',
      },
    },
  },
  BankcardsResponse: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/BankcardResponse',
    },
  },
  Bankcard: {
    properties: {
      id: {
        type: 'integer',
        default: 0,
        description: '銀行卡 Id'
      },
      createAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間',
      },
      ...BasicBankcard.properties,
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