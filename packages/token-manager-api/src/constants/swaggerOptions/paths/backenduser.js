module.exports = {
  '/backendusers/{backendUserId}': {
    put: {
      tags: ['後台使用者'],
      summary: '編輯後台使用者',
      description: '編輯後台使用者',
      operationId: 'updatebackenduser',
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
          name: 'backendUserId',
          description: '要編輯的使用者 ID',
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
            $ref: '#/definitions/UpdateBackenduser',
          },
        },
      ],
      responses: {
        200: {
          description: '編輯成功',
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
                $ref: '#/definitions/Backenduser',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['後台使用者'],
      summary: '刪除後台使用者',
      description: '刪除後台使用者',
      operationId: 'deletebackenduser',
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
          name: 'backendUserId',
          description: '要編輯的使用者 ID',
          required: true,
          schema: {
            type: 'string',
          },
        },
      ],
      responses: {
        200: {
          description: '刪除成功',
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
  '/backendusers': {
    get: {
      tags: ['後台使用者'],
      summary: '後台使用者列表',
      description: '後台使用者列表',
      operationId: 'backenduserlist',
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
          require: false,
          example: 'wendy',
          description: '後台使用者帳號',
        },
        {
          in: 'query',
          type: 'string',
          name: 'name',
          require: false,
          example: 'wendy',
          description: '後台使用者暱稱',
        },
        {
          in: 'query',
          type: 'number',
          name: 'status',
          require: false,
          example: 1,
          enum: [0, 1],
          description: '帳號狀態: 0: 停用, 1: 啟用',
        },
        {
          in: 'query',
          type: 'number',
          name: 'page',
          require: false,
          default: 1,
          description: '頁數',
        },
        {
          in: 'query',
          type: 'number',
          name: 'size',
          require: false,
          default: 10,
          description: '每頁資訊',
        },
      ],
      responses: {
        200: {
          description: '新增成功',
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
                $ref: '#/definitions/Backendusers',
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['後台使用者'],
      summary: '新增後台使用者',
      description: '新增後台使用者',
      operationId: 'createbackenduser',
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
            $ref: '#/definitions/CreateBackenduser',
          },
        },
      ],
      responses: {
        200: {
          description: '後台使用者列表',
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
                $ref: '#/definitions/Backendusers',
              },
            },
          },
        },
      },
    },
  },
};
