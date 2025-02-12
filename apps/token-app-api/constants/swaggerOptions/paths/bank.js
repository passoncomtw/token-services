module.exports = {
  '/banks': {
    get: {
      tags: ['銀行'],
      summary: '取回銀行列表',
      description: '取回銀行列表',
      operationId: 'getbanks',
      consumes: ['application/json'],
      produces: ['application/json'],
      parameters: [],
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
                $ref: "#/definitions/Banks",
              },
            },
          },
        },
      },
    },
  },
};