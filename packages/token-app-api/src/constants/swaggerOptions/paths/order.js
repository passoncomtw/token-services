module.exports = {
  "/orders/{order_id}/reject": {
    put: {
      tags: ["訂單"],
      summary: "取消訂單",
      description: "取消訂單",
      operationId: "rejectorders",
      consumes: ["application/json"],
      produces: ["application/json"],
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
          name: "order_id",
          description: "交易 Id",
          required: true,
          default: 1,
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
            properties: {
              cancelReason: {
                type: "string",
                description: '取消原因',
                default: '就是想取消',
              },
            },
          },
        }
      ],
      responses: {
        200: {
          description: "取消訂單",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/Order",
              },
            },
          },
        },
      },
    },
  },
  "/orders/{order_id}/apply": {
    put: {
      tags: ["訂單"],
      summary: "放行",
      description: "放行",
      operationId: "applyorders",
      consumes: ["application/json"],
      produces: ["application/json"],
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
          name: "order_id",
          description: "交易 Id",
          required: true,
          default: 1,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "放行",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/Order",
              },
            },
          },
        },
      },
    },
  },
  "/orders/{order_id}/paid": {
    put: {
      tags: ["訂單"],
      summary: "付款已完成",
      description: "付款已完成",
      operationId: "paidorders",
      consumes: ["application/json"],
      produces: ["application/json"],
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
          name: "order_id",
          description: "交易 Id",
          required: true,
          default: 1,
          schema: {
            type: "string",
          },
        },
      ],
      responses: {
        200: {
          description: "付款已完成",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/Order",
              },
            },
          },
        },
      },
    },
  },
  "/orders": {
    get: {
      tags: ["訂單"],
      summary: "取回訂單列表",
      description: "取回訂單列表",
      operationId: "getorders",
      consumes: ["application/json"],
      produces: ["application/json"],
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
          description: "取回列表",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "array",
                $ref: "#/definitions/Orders",
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["訂單"],
      summary: "建立訂單",
      description: "建立一筆訂單",
      operationId: "CreateOrder",
      consumes: ["application/json"],
      produces: ["application/json"],
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
            $ref: "#/definitions/CreateOrder",
          },
        },
      ],
      responses: {
        200: {
          description: "新增成功",
          schema: {
            type: "object",
            $ref: "#/definitions/Order",
          },
        },
      },
    },
  },
};
