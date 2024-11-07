module.exports = {
  "/health-check": {
    get: {
      tags: ["檢查服務狀態"],
      summary: "檢查服務狀態",
      description: "檢查服務狀態",
      operationId: "healthCheck",
      consumes: ["application/json"],
      produces: ["application/json"],
      parameters: [],
      responses: {
        200: {
          description: "服務狀態",
          schema: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                default: true,
              },
              data: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    default: 'WORKING',
                    enum: ['WORKING: 正常', 'STOP: 停止', 'MAINTAIN: 維護中'],
                    description: "服務狀態"
                  },
                },
              },
            },
          },
        },
      },
    }
  },
};