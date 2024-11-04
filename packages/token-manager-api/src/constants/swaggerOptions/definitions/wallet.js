const BASIC_WALLET = {
  status: {
    type: 'integer',
    description: '錢包狀態',
    default: 1,
    enum: ['0: 凍結', '1: 啟用'],
  },
  usefulBalance: {
    type: 'number',
    description: '可用額度',
    default: 100,
  },
  guaranteedBalance: {
    type: 'number',
    description: '保證金額度',
    default: 90,
  },
  freezeBalance: {
    type: 'number',
    description: '凍結額度',
    default: 30,
  },
};

module.exports = {
  Wallet: {
    required: [],
    properties: {
      id: {
        type: 'integer',
        description: '錢包 Id',
        uniqueItems: true,
        default: 1,
      },
      ...BASIC_WALLET,
      createAt: {
        type: 'string',
        description: '建立時間',
        default: 1131231311322,
      },
    },
  },
  Wallets: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/Wallet',
    },
  },
};
