const backendActorPermissions = {
  type: 'array',
  description: '全像陣列',
  items: {
    type: 'string',
    description: 'permission Id',
    default: '1',
  },
};

const Backendactor = {
  name: {
    type: 'string',
    description: '後台角色名稱',
    default: 'admin',
  },
  markup: {
    type: 'string',
    description: '後台角色 說明',
    required: true,
    default: 'testadmin',
  },
  permissions: backendActorPermissions,
};

module.exports = {
  backendActorPermissions,
  createBackendactor: {
    properties: Backendactor,
  },
  Backendactor: {
    properties: {
      id: {
        type: 'integer',
        description: '後台使用者 Id',
        uniqueItems: true,
        default: 1,
      },
      ...Backendactor,
      permissions: {
        type: 'object',
        $ref: '#/definitions/backendActorPermissions',
      }
    },
  },
};
