module.exports = {
  '/orders/{orderId}': {
    put: {
      tags: ['訂單'],
      deleted: true,
      summary: '完成訂單',
      description: '完成訂單',
      operationId: 'finishTransaction',
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
          name: 'orderId',
          description: '訂單 id',
          required: true,
          example: '59ce32c9-ae02-4355-b1dc-d66965b24d0f',
          schema: {
            type: 'string',
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
                $ref: '#/definitions/Order',
              },
            },
          },
        },
      },
    },
  },
  '/orders/{orderId}/cancel': {
    put: {
      tags: ['訂單'],
      deleted: true,
      summary: '取消訂單',
      description: '取消訂單',
      operationId: 'cancelTransaction',
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
          name: 'orderId',
          description: '訂單 id',
          required: true,
          example: '59ce32c9-ae02-4355-b1dc-d66965b24d0f',
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
              cancelReason: {
                type: 'string',
                default: 'test',
                description: '取消的原因',
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
                $ref: '#/definitions/Order',
              },
            },
          },
        },
      },
    },
  },
  '/orders': {
    get: {
      tags: ['訂單'],
      deleted: true,
      summary: '訂單列表',
      description: '訂單列表',
      operationId: 'transactionList',
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
          name: 'account',
          description: '使用者的 帳號',
          required: false,
          example: 'wendy',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'payer',
          description: '收款人/付款人 的暱稱',
          required: false,
          example: 'wendy',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'cancelReason',
          description: '取消的理由',
          required: false,
          example: 'test',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'startAt',
          description: '搜尋訂單建立的時間區段 startAt',
          required: false,
          example: '2021-04-01 09:00:00',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'endAt',
          description: '搜尋訂單建立的時間區段 endAt',
          required: false,
          example: '2021-12-02 19:00:00',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'type',
          description: '交易類型: 0: 買幣, 1: 賣幣',
          required: false,
          enum: [0, 1],
          schema: {
            type: 'string',
          },
        },        
        {
          in: 'query',
          name: 'orderId',
          description: '訂單編號',
          required: false,
          example: 'ajkasjl12313',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'status',
          description: '訂單狀態: 0: 等待匯款, 1: 已匯款未放行, 2: 已放行, 3: 買家已取消, 4: 賣家已取消',
          required: false,
          example: 'ajkasjl12313',
          enum: [0, 1, 2, 3, 4],
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'minAmount',
          description: '最低金額的數量',
          required: false,
          example: 0,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'maxAmount',
          description: '最高金額數量',
          required: false,
          example: 10,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'userId',
          type: 'string',
          require: false,
          default: 0,
          description: '建立訂單的使用者id',
        },
        {
          in: 'query',
          name: 'finishAtType',
          enum: ['overdue', 'notOverdue'],
          description: '交易時間, 沒有值代表全部, overdue: 逾期, notOverdue: 未逾期',
          require: false,
          schema: {
            type: 'string'
          },
        },
        {
          in: 'query',
          name: 'page',
          require: false,
          default: 1,
          schema: {
            type: 'number'
          },
        },
        {
          in: 'query',
          name: 'size',
          require: false,
          default: 10,
          schema: {
            type: 'number'
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
                properties: {
                  count: {
                    type: 'number',
                    description: '總筆數',
                    default: 10,
                  },
                  rows: {
                    type: 'array',
                    $ref: '#/definitions/OrderResponse',
                  },
                },                
              },
            },
          },
        },
      },
    },
  },
};