module.exports = {
  '/pending/orders/{pendingorder_id}/unlock': {
    put: {
      tags: ['掛單'],
      summary: '解除凍結掛單',
      description: '解除凍結掛單',
      operationId: 'unlockpendingorder',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: "header",
          name: "Authorization",
          description: "Bearer ${{token}}",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          in: "path",
          name: "pendingorder_id",
          description: "掛單 Id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: '解除凍結掛單成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
            },
          },
        },
      },
    },
  },
  '/pending/orders/{pendingorder_id}/lock': {
    put: {
      tags: ['掛單'],
      summary: '凍結掛單',
      description: '凍結掛單',
      operationId: 'lockpendingorder',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: "header",
          name: "Authorization",
          description: "Bearer ${{token}}",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          in: "path",
          name: "pendingorder_id",
          description: "掛單 Id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: '凍結掛單成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
            },
          },
        },
      },
    },
  },
  '/pending/orders/{pendingorder_id}': {
    get: {
      tags: ['掛單'],
      summary: '取回掛單詳情',
      description: '取回掛單詳情',
      operationId: 'getpendingorder',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: "header",
          name: "Authorization",
          description: "Bearer ${{token}}",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          in: "path",
          name: "pendingorder_id",
          description: "掛單 Id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: '刪除掛單成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/PendingOrder",
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['掛單'],
      summary: '刪除掛單',
      description: '刪除掛單',
      operationId: 'deletependingorder',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: "header",
          name: "Authorization",
          description: "Bearer ${{token}}",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          in: "path",
          name: "pendingorder_id",
          description: "掛單 Id",
          required: true,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: '刪除掛單成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
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
      summary: '取回掛單',
      description: '取回掛單列表',
      operationId: 'getpendingorders',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: "header",
          name: "Authorization",
          description: "Bearer ${{token}}",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          in: "query",
          name: "type",
          description: "掛單類型: 0: 買幣, 1: 賣幣",
          required: false,
          enum: [ 0, 1],
        },
        {
          in: "query",
          name: "balance",
          description: "掛單的餘額搜尋",
          required: false,
        },
        {
          in: "query",
          name: "size",
          description: "取回幾筆資料",
          required: false,
          schema: {
            type: "string",
          },
          default: 1,
        },
        {
          in: "query",
          name: "page",
          description: "取為第幾頁的資料",
          required: false,
          schema: {
            type: "string",
          },
          default: 1,
        },
      ],
      responses: {        
        200: {
          description: "取回列表成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/PendingOrders",
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['掛單'],
      summary: '建立掛單',
      description: '建立一筆掛單',
      operationId: 'creatependingorder',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [
        {
          in: "header",
          name: "Authorization",
          description: "Bearer ${{token}}",
          required: true,
          schema: {
            type: "string",
          },
        },
        {
          in: "body",
          type: "object",
          name: "data",
          schema: {
            type: "object",
            $ref: "#/definitions/CreatePendingOrder",
          },
        },
      ],
      responses: {
        200: {
          description: '新增掛單成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/PendingOrder",
              },
            },
          },
        },
      },
    },
  },
};
