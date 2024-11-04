module.exports = {
  '/bankcards/{bankcard_id}': {
    put: {
      tags: ['銀行卡'],
      summary: '編輯銀行卡',
      description: '編輯銀行卡',
      operationId: 'updatebandcard',
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
          name: "bankcard_id",
          description: "銀行卡ID",
          required: true,
          schema: {
            type: "string",
          },
          default: 1,
        },
        {
          in: "body",
          type: "object",
          name: "data",
          required: true,
          schema: {
            type: "object",
            $ref: "#/definitions/UpdateBankcard",
          },
        }
      ],
      responses: {
        200: {
          description: '新增成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/Bankcard",
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['銀行卡'],
      summary: '刪除銀行卡',
      description: '刪除銀行卡',
      operationId: 'deletebandcard',
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
          name: "bankcard_id",
          description: "銀行卡ID",
          required: true,
          schema: {
            type: "string",
          },
          default: 1,
        },
      ],
      responses: {
        200: {
          description: '刪除成功',
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
  '/bankcards': {
    get: {
      tags: ['銀行卡'],
      summary: '取回銀行卡列表',
      description: '取回銀行卡列表',
      operationId: 'getbandcard',
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
      ],
      responses: {
        200: {
          description: '取回列表成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/Bankcards",
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['銀行卡'],
      summary: '新增銀行卡',
      description: '新增銀行卡',
      operationId: 'createbandcard',
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
          required: true,
          schema: {
            type: "object",
            $ref: "#/definitions/CreateBankcard",
          },
        }
      ],
      responses: {
        200: {
          description: '新增成功',
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/Bankcard",
              },
            },
          },
        },
      },
    },
  },
};