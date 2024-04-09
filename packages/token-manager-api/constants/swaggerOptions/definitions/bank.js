const BASIC_BANK = {
  bankName: {
    type: 'string',
    description: '銀行名稱',
    default: '中国农业银行',
  },
  bankCode: {
    type: 'string',
    description: '銀行代碼',
    default: 'CDC'
  },
  status: {
    type: 'number',
    description: '銀行狀態: 0: 凍結, 1: 啟用',
    enum: [0, 1],
    default: 1,
  },
};

module.exports = {
  createBank: {
    properties: {
      ...BASIC_BANK,
      status: undefined,
    },
  },
  basicBank: {
    properties: {
      id: {
        type: 'integer',
        description: '銀行 Id',
        uniqueItems: true,
        default: 1,
      },
      ...BASIC_BANK
    },
  },
  basicBanks: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/basicBank',
    },
  },
};