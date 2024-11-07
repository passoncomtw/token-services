module.exports = {
  '/pending/orders/{pendingOrderId}': {
    delete: {
      tags: ['掛單'],
      deleted: true,
      summary: '刪除掛單',
      description: '刪除掛單',
      operationId: 'deleteOrder',
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
          name: 'pendingOrderId',
          description: '掛單的 id: UUID',
          required: true,
          example: '634f5e3d-f591-4cd5-87ad-aed2bc12cb5b',
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
            },
          },
        },
      },
    },
  },
  '/pending/orders/{pendingOrderId}/open': {
    put: {
      tags: ['掛單'],
      deleted: true,
      summary: '開啟掛單',
      description: '開啟掛單',
      operationId: 'openOrder',
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
          name: 'pendingOrderId',
          description: '掛單的 id: UUID',
          required: true,
          example: '634f5e3d-f591-4cd5-87ad-aed2bc12cb5b',
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
            },
          },
        },
      },
    },
  },
  '/pending/orders/{pendingOrderId}/cancel': {
    put: {
      tags: ['掛單'],
      deleted: true,
      summary: '取消掛單',
      description: '取消掛單',
      operationId: 'cancelOrder',
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
          name: 'pendingOrderId',
          description: '掛單的 id: UUID',
          required: true,
          example: '634f5e3d-f591-4cd5-87ad-aed2bc12cb5b',
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
            },
          },
        },
      },
    },
  },
  '/pending/orders/{pendingOrderId}/stop': {
    put: {
      tags: ['掛單'],
      deleted: true,
      summary: '暫停掛單',
      description: '暫停掛單',
      operationId: 'stopOrder',
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
          name: 'pendingOrderId',
          description: '掛單的 id: UUID',
          required: true,
          example: '634f5e3d-f591-4cd5-87ad-aed2bc12cb5b',
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
            },
          },
        },
      },
    },
  },
  '/pending/orders': {
    get: {
      tags: ['掛單'],
      deleted: true,
      summary: '掛單列表',
      description: '掛單列表',
      operationId: 'pendingOrders',
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
          name: 'pendingOrderId',
          description: '掛單 ID',
          required: false,
          example: 'c66dc29e-fd6d-43c2-9b21-1c12a25c4226',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'startAt',
          description: '開始的時間',
          required: false,
          example: '2021-04-01 00:00:00',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'endAt',
          description: '結束的時間',
          required: false,
          example: '2021-04-02 00:00:00',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'account',
          description: '建立掛單的使用者 account',
          required: false,
          // default: 'simon',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'minAmount',
          description: '最小的數量',
          required: false,
          // default: 0,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'maxAmount',
          description: '最大的數量',
          required: false,
          // default: 10,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'minBalance',
          description: '最小的餘額',
          required: false,
          // default: 0,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'maxBalance',
          description: '最大的餘額',
          required: false,
          // default: 10,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'userId',
          type: 'string',
          require: false,
          // default: 0,
          description: '建立掛單的使用者id',
        },
        {
          in: 'query',
          name: 'type',
          type: 'integer',
          require: false,
          // default: 0,
          description: '類型: 0: 買幣, 1: 賣幣',
          enum: [0, 1],
        },
        {
          in: 'query',
          name: 'status',
          type: 'integer',
          require: false,
          // default: 0,
          description: '掛單狀態: 0: 掛單中, 1: 暫停掛單, 2: 取消掛單, 3: 已刪除掛單',
          enum: [0, 1, 2, 3],

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
                    description: '總共筆數',
                    default: 1,
                  },
                  rows: {
                    type: 'array',
                    items: {
                      type: 'object',
                      $ref: '#/definitions/PendingOrder',
                    },
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
