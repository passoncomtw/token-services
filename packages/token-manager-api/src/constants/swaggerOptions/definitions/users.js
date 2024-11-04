const BASIC_USER = {
  type: {
    type: 'integer',
    description: '使用者類型',
    default: 0,
    enum: ['0: 一般使用者', '1: 平台使用者'],
  },
  account: {
    type: 'string',
    description: '使用者帳號',
    default: 'simon',
  },
  name: {
    type: 'string',
    description: '使用者名稱',
    default: 'simon',
  },
};

const BASIC_MERCHANT = {
  contactor: {
    type: 'string',
    description: '聯絡人姓名',
    default: '溫蒂s',
  },
  telegram: {
    type: 'string',
    description: 'Telegram id',
    default: 'abcccccc',
  },
  buyFeeType: {
    type: 'number',
    description: '購買手續費類型: 0: 百分比手續費, 1: 階梯式手續費',
    default: 0,
  },
  sellFeeType: {
    type: 'number',
    description: '販售手續費類型: 0: 百分比手續費, 1: 階梯式手續費',
    default: 0,
  },
  buyPercentageFee: {
    type: 'object',
    description: '購買手續費 百分比 級距',
    default: {
      "feePercent": 0.6,
      "minFee": 0,
      "maxFee": 1000
    },
  },
  sellPercentageFee: {
    type: 'object',
    description: '販售手續費 百分比 級距',
    default: {
      "feePercent": 0.6,
      "minFee": 0,
      "maxFee": 1000
    },
  },
  buyLadderFee: {
    type: 'array',
    description: '購買手續費 階梯式 級距',
    default: [
      {
        "amount": 100,
        "feePercent": 0.1
      },
      {
        "amount": 1000,
        "feePercent": 0.5
      }
    ],
  },
  sellLadderFee: {
    type: 'array',
    description: '販售手續費 階梯式 級距',
    default: [
      {
        "amount": 100,
        "feePercent": 0.1
      },
      {
        "amount": 1000,
        "feePercent": 0.5
      }
    ],
  },
};

const REGISTER_USER = {
  ...BASIC_USER,
  password: {
    type: 'string',
    description: '密碼: 6~20 英文數字組合',
    required: true,
    default: 'a12345678',
  },
  transactionCode: {
    type: 'string',
    description: '交易密碼: 4個數字',
    require: true,
    default: 'a12345678',
  },
  referrer: {
    type: 'string',
    description: '推薦人',
    description: '推薦人 id',
    require: true,
    default: 'a3e4e373',
  },
  ...BASIC_MERCHANT,
};

module.exports = {
  updateUserRequest: {
    required: [],
    properties: {
      phone: {
        type: 'string',
        default: '0987654321',
        description: '商家電話',
      },
      status: {
        type: 'number',
        default: 1,
        description: '帳號狀態: 0: 停用, 1: 啟用',
      },
      orderStatus: {
        type: 'number',
        default: 1,
        description: '掛單狀態: 0: 停用, 1: 啟用',
      },
      transactionStatus: {
        type: 'number',
        default: 1,
        description: '交易狀態: 0: 停用, 1: 啟用',
      },
      ...REGISTER_USER,      
      account: undefined,
      password: undefined,
      transactionCode: undefined,
      referrer: undefined,
    },
  },
  UserDetail: {
    properties: {
      id: {
        type: 'integer',
        description: '使用者 Id',
        uniqueItems: true,
        default: 1,
      },
      ...BASIC_USER,
      createAt: {
        type: 'number',
        description: '建立時間',
        default: 1131231311322,
      },
      status: {
        type: 'number',
        default: 1,
        description: '帳號狀態: 0: 停用, 1: 啟用',
      },
      orderStatus: {
        type: 'number',
        default: 1,
        description: '掛單狀態: 0: 停用, 1: 啟用',
      },
      transactionStatus: {
        type: 'number',
        default: 1,
        description: '交易狀態: 0: 停用, 1: 啟用',
      },
      phone: {
        type: 'string',
        default: '0987654321',
        description: '商家電話',
      },
      markup: {
        type: 'string',
        default: 'test mark up',
        description: '備註',
      },
      merchant: {
        type: 'object',
        require: false,
        default: null,
        $ref: '#/definitions/Merchant',
      },
      wallet: {
        type: 'object',
        require: false,
        default: null,
        $ref: '#/definitions/Wallet',
      },
    },
  },
  User: {
    required: [],
    properties: {
      id: {
        type: 'integer',
        description: '使用者 Id',
        uniqueItems: true,
        default: 1,
      },
      ...BASIC_USER,
      createAt: {
        type: 'number',
        description: '建立時間',
        default: 1131231311322,
      },
      merchant: {
        type: 'object',
        require: false,
        default: null,
        $ref: '#/definitions/Merchant',
      }
    },
  },
  Merchant: {
    properties: {
      createAt: {
        type: 'number',
        description: '建立時間',
        default: 1131231311322,
      },
      ...BASIC_MERCHANT,
    }
  },
  UpdateUserLoginPassword: {
    properties: {
      password: {
        type: 'string',
        description: '新密碼: 6~20 英文數字組合',
        required: true,
        default: 'a12345678',
      },
    }
  },
  UpdateUserTransactionCode: {
    properties: {
      password: {
        type: 'string',
        description: '新交易密碼: 4個數字',
        required: true,
        default: 'a12345678',
      },
    }
  },
  REGISTER_USER: {
    required: [],
    properties: REGISTER_USER,
  },
  Users: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/User',
    },
  },
};
