module.exports = {
  // "/auth/refresh": {
  //   post: {
  //     tags: ["使用者驗證"],
  //     summary: "使用者更新 Token(UNDO)",
  //     description: "使用者更新 Token",
  //     operationId: "refreshToken",
  //     parameters: [
  //       {
  //         in: "header",
  //         name: "Authorization",
  //         description: "Bearer ${{token}}",
  //         required: true,
  //         schema: {
  //           type: "string",
  //         },
  //       },
  //     ],
  //     responses: {
  //       200: {
  //         description: "更新成功",
  //         schema: {
  //           type: "object",
  //           properties: {
  //             success: {
  //               type: "boolean",
  //               default: true,
  //             },
  //             data: {
  //               type: "object",
  //               $ref: "#/definitions/LOGIN_RESPONSE",
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // },
  "/auth/logout": {
    post: {
      tags: ["使用者驗證"],
      summary: "使用者登出",
      description: "使用者登出",
      operationId: "logout",
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
          description: "登出成功",
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
  "/auth/login": {
    post: {
      tags: ["使用者驗證"],
      summary: "使用者登入",
      description: "使用者登入取回 JWT token",
      operationId: "login",
      parameters: [
        {
          in: "body",
          type: "object",
          name: "data",
          schema: {
            type: "object",
            properties: {
              account: {
                type: "string",
                require: true,
                description: '帳號',
                default: "simon",
              },
              password: {
                type: "string",
                require: true,
                description: '密碼',
                default: "a12345678",
              },
              notificationToken: {
                type: "string",
                require: false,
                description: '推播 token',
                default: "abcde"
              },
            },
          },
        },
      ],
      responses: {
        200: {
          description: "OK",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "object",
                $ref: "#/definitions/LOGIN_RESPONSE",
              },
            },
          },
        },
      },
    },
  },
};
