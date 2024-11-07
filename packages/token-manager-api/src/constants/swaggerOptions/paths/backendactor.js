module.exports = {
  '/backendactors/permissions': {
    get: {
      tags: ['後台角色'],
      summary: '取回所有的權限',
      description: '取回所有的權限',
      operationId: 'getPermissions',
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
        200: {
          description: '取回成功',
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
                properties: {
                  functionName: {
                    type: 'string',
                    description: '權限名稱',
                    default: '会员管理',
                  },
                  functionIdentify: {
                    type: 'number',
                    description: '權限 Id',
                    default: 1,
                  },
                  parentId: {
                    type: 'number',
                    description: '父層權限 Id, 第一層是 null',
                    default: null,
                  },
                  children: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        functionName: {
                          type: 'string',
                          description: '權限名稱',
                          default: '订单（检视）',
                        },
                        functionIdentify: {
                          type: 'number',
                          description: '權限 Id',
                          default: 2,
                        },
                        parentId: {
                          type: 'number',
                          description: '父層權限 Id, 第一層是 null',
                          default: 1,
                        },
                      },
                    },
                  }
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['後台角色'],
      summary: '新增後台角色',
      description: '新增後台角色',
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
            $ref: '#/definitions/createBackendactor',
          },
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
                $ref: '#/definitions/Backendactor',
              },
            },
          },
        },
      },
    },
  },
  '/backendactors': {
    get: {
      tags: ['後台角色'],
      summary: '取回角色列表',
      description: '取回角色列表',
      operationId: 'getBackendActors',
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
        200: {
          description: '取回成功',
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
                $ref: '#/definitions/Backendactor',
              },
            },
          },
        },
      },
    },
    post: {
      tags: ['後台角色'],
      summary: '新增後台角色',
      description: '新增後台角色',
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
            $ref: '#/definitions/createBackendactor',
          },
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
                $ref: '#/definitions/Backendactor',
              },
            },
          },
        },
      },
    },
  },
  '/backendactors/{backendActorId}': {
    put: {
      tags: ['後台角色'],
      summary: '編輯後台角色',
      description: '編輯後台角色',
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
          name: 'backendActorId',
          description: '角色 ID',
          required: true,
          schema: {
            type: 'string',
          },
          default: 1,
        },
        {
          in: 'body',
          type: 'object',
          name: 'data',
          schema: {
            type: 'object',
            $ref: '#/definitions/createBackendactor',
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
                $ref: '#/definitions/Backendactor',
              },
            },
          },
        },
      },
    },
    delete: {
      tags: ['後台角色'],
      summary: '刪除後台角色',
      description: '刪除後台角色',
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
          name: 'backendActorId',
          description: '角色 ID',
          required: true,
          schema: {
            type: 'string',
          },
          default: 1,
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
};
