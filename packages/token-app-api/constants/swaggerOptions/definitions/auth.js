module.exports = {
  LOGIN_RESPONSE: {
    required: [],
    properties: {
      access_token: {
        type: "string",
        default:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MCwiYWNjb3VudCI6Im1vY2tVc2VyIiwiaWF0IjoxNjIyMTE5NTE0fQ.BHI-z8S1ETsbHbbhCiwQ4yMrxdKcnrL7E-srJ5VK-w4",
        description: "jwt 前面需要加上 Berare 使用",
      },
      expireIn: {
        type: "integer",
        default: 1000000,
        description: "到期的時間戳",
      },
      user: {
        type: "object",
        $ref: "#/definitions/User",
      },
    },
  },
};
