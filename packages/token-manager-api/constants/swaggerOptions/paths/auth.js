module.exports = {
  '/auth/login/password': {
    post: {
      tags: ['使用者驗證'],
      summary: '編輯後台使用者登入密碼',
      description: '編輯後台使用者登入密碼',
      operationId: 'updateBackendUserLoginPassword',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: 'header',
          name: 'Authorization',
          description: 'Bearer ${{token}}',
          required: true,
          schema: {
            type: 'string',
          },
        },
        {
          in: 'body',
          type: 'object',
          name: 'data',
          schema: {
            type: 'object',
            properties: {
              password: {
                type: 'string',
                description: '舊密碼: 6~20 英文數字組合',
                required: true,
                default: 'a12345678',
              },
              newPassword: {
                type: 'string',
                description: '新密碼: 6~20 英文數字組合',
                required: true,
                default: 'a123456789',
              },
            },
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '編輯登入密碼成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
            },
          },
        },
      },
    },
  },
  '/auth/logout': {
    post: {
      tags: ['使用者驗證'],
      summary: '使用者登出',
      description: '使用者登出',
      operationId: 'logout',
      parameters: [
        {
          in: 'header',
          name: 'Authorization',
          description: 'Bearer ${{token}}',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: '登出成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                default: true,
              },
            },
          },
        },
      },
    },
  },
  '/auth/login': {
    post: {
      tags: ['使用者驗證'],
      summary: '使用者登入',
      description: '使用者登入取回 JWT token',
      operationId: 'login',
      parameters: [
        {
          in: 'body',
          type: 'object',
          name: 'data',
          schema: {
            type: 'object',
            properties: {
              account: {
                type: 'string',
                default: 'admin2021',
              },
              password: {
                type: 'string',
                default: 'a12345678',
              },
            },
          },
        },
      ],
      responses: {
        200: {
          description: 'OK',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/LOGIN_RESPONSE',
              },
            },
          },
        },
      },
    },
  },
};
