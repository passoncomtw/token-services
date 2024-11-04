module.exports = {
  '/bankcards/{bankcardId}': {
    get: {
      tags: ['銀行卡'],
      delete: true,
      summary: '銀行卡詳細資訊',
      description: '銀行卡詳細資訊',
      operationId: 'bankcardDetail',
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
          name: 'bankcardId',
          description: '銀行卡 Id',
          required: true,
          default: 1,
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
                $ref: '#/definitions/Bankcard',
              },
            },
          },
        },
      },
    },
  },
  '/bankcards': {
    get: {
      tags: ['銀行卡'],
      deleted: true,
      summary: '銀行卡列表',
      description: '銀行卡列表 有 query 的話要做 url encode',
      operationId: 'getBankcards',
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
          name: 'cardNumber',
          description: '銀行卡卡號',
          required: false,
          example: '1231231231',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'bankCode',
          description: '銀行代碼',
          required: false,
          example: 'CDC',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'branchName',
          description: '開戶支行',
          required: false,
          example: '民生支行',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'bankName',
          description: '開戶行',
          required: false,
          example: '中央銀行',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'name',
          description: '銀行卡 使用者姓名',
          required: false,
          example: '温蒂',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'account',
          description: '銀行卡 使用者帳號',
          required: false,
          example: 'tomasdemo001',
          schema: {
            type: 'string',
          },
        },
        {
          in: 'query',
          name: 'page',
          description: '頁數',
          required: true,
          example: 1,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'query',
          name: 'size',
          description: '每頁筆數',
          required: true,
          example: 10,
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
                    default: 100,
                  },
                  rows: {
                    type: 'array',
                    $ref: '#/definitions/BankcardsResponse',
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