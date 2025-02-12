const backendactorDefined = require('./backendactor');

const Backenduser = {
  name: {
    type: 'string',
    description: '後台使用者名稱',
    default: 'admin001',
  },
  name: {
    type: 'string',
    description: '後台使用者名稱',
    default: 'admin001',
  },
  account: {
    type: 'string',
    description: '後台使用者 帳號',
    required: true,
    default: 'testadmin',
  },
  status: {
    type: 'number',
    description: '帳號狀態: 0: 停用, 1: 啟用',
    default: 0,
    enum: [0, 1],
    require: true,
  },
  permissions: backendactorDefined.backendActorPermissions,
  actors: {
    type: 'array',
    items: {
      description: '後台角色的 Id',
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          description: '後台使用者 Id',
          uniqueItems: true,
          default: 1,
        },
        name: {
          type: 'string',
          description: '後台角色名稱',
          default: 'admin',
        },
        markup: {
          type: 'string',
          description: '後台角色名稱',
          default: 'admin',
        },
      },
    },
  },
};

module.exports = {
  UpdateBackenduser: {
    properties: {
      ...Backenduser,
      permissions: undefined,
      actors: undefined,
    },
  },
  CreateBackenduser: {
    properties: {
      ...Backenduser,
      status: undefined,
      password: {
        type: 'string',
        description: '後台使用者 密碼',
        required: true,
        default: 'a12345678',
      },
    },
  },
  Backenduser: {
    properties: {
      id: {
        type: 'integer',
        description: '後台使用者 Id',
        uniqueItems: true,
        default: 1,
      },
      ...Backenduser,
    },
  },
  Backendusers: {
    type: 'array',
    $ref: '#/definitions/Backenduser',
  },
};
