const BasicBank = {
  required: [],
  properties: {
    bankCode: {
      type: 'string',
      default: 'CDC',
      description: '銀行代碼'
    },
    bankName: {
      type: 'string',
      default: '中國銀行',
      description: '銀行名稱'
    },
    status: {
      type: 'integer',
      default: 0,
      description: '銀行狀態',
      enum: ['0: 凍結', '1: 啟用']
    },
  },
};

module.exports = {
  Bank: {
    properties: {
      id: {
        type: 'integer',
        default: 0,
        description: '銀行 Id'
      },
      createdAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間'
      },
      ...BasicBank.properties,
    },
  },
  Banks: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/Bank',
    },
  },
};