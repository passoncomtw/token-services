module.exports = {
  '/users/{userId}/unlock': {
    put: {
      tags: ['使用者'],
      summary: '解鎖使用者',
      description: '解鎖使用者',
      operationId: 'unlockUser',
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
          in: 'path',
          name: 'userId',
          description: 1,
          required: true,
          schema: {
            type: 'number',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '解鎖成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/UserDetail',
              },
            },
          },
        },
      },
    },
  },
  '/users/{userId}/transaction/password': {
    put: {
      tags: ['使用者'],
      summary: '編輯使用者交易密碼',
      description: '編輯使用者交易密碼',
      operationId: 'updateUserTransationPassword',
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
          in: 'path',
          name: 'userId',
          description: 1,
          required: true,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'body',
          type: 'object',
          name: 'data',
          schema: {
            type: 'object',
            $ref: '#/definitions/UpdateUserTransactionCode',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '修改成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/UserDetail',
              },
            },
          },
        },
      },
    },
  },
  '/users/{userId}/login/password': {
    put: {
      tags: ['使用者'],
      summary: '編輯使用者登入密碼',
      description: '編輯使用者登入密碼',
      operationId: 'updateUserLoginPassword',
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
          in: 'path',
          name: 'userId',
          description: 1,
          required: true,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'body',
          type: 'object',
          name: 'data',
          schema: {
            type: 'object',
            $ref: '#/definitions/UpdateUserLoginPassword',
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
  '/users/{userId}/bankcards': {
    get: {
      tags: ['使用者'],
      summary: '取得使用者銀行卡列表',
      description: '取得使用者銀行卡列表',
      operationId: 'getUserBankcards',
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
          in: 'path',
          name: 'userId',
          description: '使用者 Id',
          required: true,
          schema: {
            type: 'number',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '取回列表成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/Bankcards',
              },
            },
          },
        },
      },
    },
  },
  '/users/{userId}/pending/orders': {
    get: {
      tags: ['使用者'],
      summary: '取得使用者掛單列表',
      description: '取得使用者掛單列表',
      operationId: 'getUserPendingOrders',
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
          in: 'path',
          name: 'userId',
          description: '使用者 Id',
          required: true,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'page',
          description: '取為第幾頁的資料',
          required: false,
          schema: {
            type: 'string',
          },
          default: 1,
        },
        {
          in: 'query',
          name: 'size',
          description: '取回幾筆資料',
          required: false,
          schema: {
            type: 'string',
          },
          default: 1,
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '取回列表成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                properties: {
                  rows: {
                    type: 'array',
                    $ref: '#/definitions/PendingOrders',
                  },
                  count: {
                    type: 'number',
                    description: '總筆數',
                    default: 10,
                  },
                },                
              },
            },
          },
        },
      },
    },
  },
  '/users/{userId}/orders': {
    get: {
      tags: ['使用者'],
      summary: '取得使用者訂單列表',
      description: '取得使用者訂單列表',
      operationId: 'getUserOrders',
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
          in: 'path',
          name: 'userId',
          description: '使用者 Id',
          required: true,
          schema: {
            type: 'number',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '取回列表成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/Orders',
              },
            },
          },
        },
      },
    },
  },
  '/users/{userId}': {
    get: {
      tags: ['使用者'],
      summary: '取得使用者詳細資訊',
      description: '取得使用者詳細資訊',
      operationId: 'getUserDetail',
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
          in: 'path',
          name: 'userId',
          description: '使用者Id',
          required: true,
          schema: {
            type: 'number',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: '取回資訊成功',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/UserDetail',
              },
            },
          },
        },
      },
    },
    put: {
      tags: ['使用者'],
      summary: '編輯使用者(商家)',
      description: '編輯使用者(商家)',
      operationId: 'updateMerchant',
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
          in: 'path',
          description: '要編輯的使用者 Id',
          type: 'number',
          name: 'userId',
        },
        {
          in: 'body',
          type: 'object',
          name: 'data',
          schema: {
            type: 'object',
            $ref: '#/definitions/updateUserRequest',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: 'OK',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/User',
              },
            },
          },
        },
      },
    },    
  },
  '/users/login/password': {
    put: {
      tags: ['使用者'],
      summary: '編輯自己的登入密碼',
      description: '編輯自己的登入密碼',
      operationId: 'updateSelfLoginPassword',
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
                description: '舊密碼',
                default: 'a12345678',
              },
              newPassword: {
                type: 'string',
                description: '新密碼',
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
          description: '編輯自己登入密碼成功',
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
  '/users': {
    get: {
      tags: ['使用者'],
      delete: true,
      summary: '使用者列表',
      description: '使用者列表',
      operationId: 'getusers',
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
          in: 'query',
          type: 'string',
          name: 'account',
          description: '使用者帳號',
          require: false,
          example: 'edmond',
        },
        {
          in: 'query',
          type: 'string',
          name: 'email',
          description: '使用者信箱',
          require: false,
          example: 'aaa@bbb.cc',
        },
        {
          in: 'query',
          type: 'string',
          name: 'name',
          description: '使用者暱稱',
          require: false,
          example: 'edmond',
        },
        {
          in: 'query',
          type: 'number',
          name: 'status',
          description: '會員狀態: 0: 停用, 1: 啟用',
          require: false,
          enum: [0, 1],
        },
        {
          in: 'query',
          type: 'number',
          name: 'orderStatus',
          description: '掛單狀態: 0: 凍結, 1: 啟用',
          require: false,
          enum: [0, 1],
        },
        {
          in: 'query',
          type: 'number',
          name: 'transactionStatus',
          description: '交易狀態: 0: 凍結, 1: 啟用',
          require: false,
          enum: [0, 1],
        },
        {
          in: 'query',
          type: 'boolean',
          name: 'isMerchant',
          description: '是否為商家',
          require: false,
        },
        {
          in: 'query',
          name: 'page',
          description: '取為第幾頁的資料',
          required: false,
          schema: {
            type: 'string',
          },
          default: 1,
        },
        {
          in: 'query',
          name: 'size',
          description: '取回幾筆資料',
          required: false,
          schema: {
            type: 'string',
          },
          default: 10,
        },        
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: 'OK',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/Users',
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['使用者'],
      summary: '新增使用者(商家)',
      description: '新增使用者(商家)',
      operationId: 'registerMerchant',
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
            $ref: '#/definitions/REGISTER_USER',
          },
        },
      ],
      responses: {
        500: {
          description: 'error',
        },
        200: {
          description: 'OK',
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: '是否成功',
                default: true,
              },
              data: {
                type: 'object',
                $ref: '#/definitions/User',
              },
            },
          },
        },
      },
    },    
  },
};