module.exports = {
  "/users/pending/orders": {
    get: {
      tags: ["使用者"],
      summary: "取回使用者自己建立的掛單",
      description: "取回使用者自己建立的掛單",
      operationId: "updateUserTransationPassword",
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
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "修改成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
              data: {
                type: "object",
                properties: {
                  buy: {
                    type: "object",
                    $ref: "#/definitions/UserPendingOrder",
                  },
                  sell: {
                    type: "object",
                    $ref: "#/definitions/UserPendingOrder",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/users/login/password": {
    put: {
      tags: ["使用者"],
      summary: "編輯使用者登入密碼",
      description: "編輯使用者登入密碼",
      operationId: "updateUserLoginPassword",
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
            $ref: "#/definitions/UpdateUserLoginPassword",
          },
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "編輯登入密碼成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
            },
          },
        },
      },
    },
  },
  "/users/transaction/password": {
    put: {
      tags: ["使用者"],
      summary: "編輯使用者交易密碼",
      description: "編輯使用者交易密碼",
      operationId: "updateUserTransationPassword",
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
            $ref: "#/definitions/UpdateUserTransactionCode",
          },
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "修改成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
            },
          },
        },
      },
    },
  },
  "/users/login/password": {
    put: {
      tags: ["使用者"],
      summary: "編輯使用者登入密碼",
      description: "編輯使用者登入密碼",
      operationId: "updateUserLoginPassword",
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
            $ref: "#/definitions/UpdateUserLoginPassword",
          },
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "編輯登入密碼成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
            },
          },
        },
      },
    },
  },
  "/users/{user_id}": {
    get: {
      tags: ["使用者"],
      summary: "顯示使用者資訊",
      description: "顯示使用者資訊",
      operationId: "getUser",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
        {
          in: "path",
          type: "string",
          name: "user_id",
          description: '使用者的ID',
          require: true,
          default: 1,
          value: 1,
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "取回使用者資訊成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/User",
              },
            },
          },
        },
      },
    },
    put: {
      tags: ["使用者"],
      summary: "編輯使用者資訊",
      description: "編輯使用者資訊",
      operationId: "updateUser",
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
          type: "string",
          name: "user_id",
          description: '使用者的ID',
          require: true,
          default: 1,
          value: 1,
        },
        {
          in: "body",
          type: "object",
          name: "data",
          schema: {
            type: "object",
            $ref: "#/definitions/UPDATE_USER",
          },
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "修改使用者成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/User",
              },
            },
          },
        },
      },
    },
  },
  "/users/{user_id}/store/value": {
    post: {
      tags: ["使用者"],
      summary: "自動儲存一千塊",
      description: "自動儲存一千塊",
      operationId: "storevalue",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
        {
          in: "path",
          type: "string",
          name: "user_id",
          description: '使用者的ID',
          require: true,
          default: 1,
          value: 1,
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "取回使用者資訊成功",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/User",
              },
            },
          },
        },
      },
    },
  },
  "/users": {
    post: {
      tags: ["使用者"],
      summary: "註冊",
      description: "使用者註冊",
      operationId: "registe",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [
        {
          in: "body",
          type: "object",
          name: "data",
          schema: {
            type: "object",
            $ref: "#/definitions/REGISTER_USER",
          },
        },
      ],
      responses: {
        500: {
          description: "error",
        },
        200: {
          description: "OK",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: '是否成功',
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/User",
              },
            },
          },
        },
      },
    },
  },
};