const BASIC_USER = {
  type: {
    type: "integer",
    description: "使用者類型",
    default: 0,
    enum: ["0: 一般使用者", "1: 平台使用者"],
  },
  account: {
    type: "string",
    description: "使用者帳號",
    default: "simon",
  },
  name: {
    type: "string",
    description: "使用者名稱",
    default: "simon",
  },
  email: {
    type: "string",
    description: "使用者 Email",
    required: true,
    default: "aaa@bbb.ccc",
  },
};

const REGISTER_USER = {
  ...BASIC_USER,
  password: {
    type: "string",
    description: "密碼: 6~20 英文數字組合",
    required: true,
    default: "a12345678",
  },
  transactionCode: {
    type: "string",
    description: '交易密碼: 6-20位英數混合字',
    require: true,
    default: "a123456",
  },
  referralCode: {
    type: "string",
    description: "推薦人 代碼",
    require: false,
    default: "123adsf",
  },
};

module.exports = {
  ReferralUser: {
    properties: {
      id: {
        type: "integer",
        description: "使用者 Id",
        uniqueItems: true,
        default: 1,
      },
      ...BASIC_USER,
    },
  },
  User: {
    required: [],
    properties: {
      id: {
        type: "integer",
        description: "使用者 Id",
        uniqueItems: true,
        default: 1,
      },
      ...BASIC_USER,
      createAt: {
        type: "string",
        description: "建立時間",
        default: "11312313113",
      },
      referralCode: {
        type: "string",
        description: "推薦碼",
        require: true,
        default: "adfajfjd",
      },
      email: {
        type: "string",
        description: "使用者信箱",
        require: true,
        default: "aaaaaa123@gmail.com",
      },
      wallet: {
        type: "object",
        $ref: "#/definitions/Wallet",
      },
      referralUser: {
        type: "object",
        required: false,
        description: '沒有則為 null',
        $ref: "#/definitions/ReferralUser",
      },
    },
  },
  UpdateUserLoginPassword: {
    properties: {
      password: {
        type: "string",
        description: "原密碼: 6~20 英文數字組合",
        required: true,
        default: "a12345678",
      },
      newPassword: {
        type: "string",
        description: "新密碼: 6~20 英文數字組合",
        required: true,
        default: "a12345678",
      },
    }
  },
  UpdateUserTransactionCode: {
    properties: {
      password: {
        type: "string",
        description: '交易密碼: 6-20位英數混合字',
        required: true,
        default: "a123456",
      },
      newPassword: {
        type: "string",
        description: '交易密碼: 6-20位英數混合字',
        required: true,
        default: "a123456",
      },
    }
  },
  UPDATE_USER: {
    required: [],
    properties: {
      ...BASIC_USER,
      type: undefined,
      account: undefined,
    },
  },
  REGISTER_USER: {
    required: [],
    properties: REGISTER_USER,
  },
  Users: {
    type: "array",
    items: {
      type: "object",
      $ref: "#/definitions/User",
    },
  },
};
