module.exports = {
  '/banks/{bankId}': {
    put: {
      tags: ['銀行'],
      delete: true,
      summary: '編輯銀行',
      description: '編輯銀行',
      operationId: 'updateBank',
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
          name: 'bankId',
          description: '銀行的 id',
          required: true,
          schema: {
            type: 'number',
          },
        },
        {
          in: 'body',
          name: 'data',
          description: '銀行資訊',
          required: true,
          schema: {
            type: 'object',
            $ref: '#/definitions/createBank',
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
                $ref: '#/definitions/basicBank',
              },
            },
          },
        },
      },
    },
  },
  '/banks': {
    get: {
      tags: ['銀行'],
      delete: true,
      summary: '銀行列表',
      description: '銀行列表',
      operationId: 'getBanks',
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
                type: 'array',
                $ref: '#/definitions/basicBanks',
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['銀行'],
      delete: true,
      summary: '新增銀行',
      description: '新增銀行',
      operationId: 'createBank',
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
          name: 'data',
          description: '銀行資訊',
          required: true,
          schema: {
            type: 'object',
            $ref: '#/definitions/createBank',
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
                $ref: '#/definitions/basicBank',
              },
            },
          },
        },
      },
    },
  },
};