module.exports = {
  LOGIN_RESPONSE: {
    required: [],
    properties: {
      access_token: {
        type: 'string',
        default:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiYWNjb3VudCI6Im1vY2tVc2VyIiwiaWF0IjoxNjIyMTE5NTE0fQ.BHI-z8S1ETsbHbbhCiwQ4yMrxdKcnrL7E-srJ5VK-w4',
        description: 'jwt 前面需要加上 Berare 使用',
      },
      expireIn: {
        type: 'integer',
        default: 1000000,
        description: '到期的時間戳',
      },
      user: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            description: '使用者 Id',
            uniqueItems: true,
            default: 1,
          },
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
          createAt: {
            type: 'number',
            description: '建立時間',
            default: 1131231311322,
          },
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              $ref: '#/definitions/backendActorPermissions',
            },
          },
        },
      },
    },
  },
};
