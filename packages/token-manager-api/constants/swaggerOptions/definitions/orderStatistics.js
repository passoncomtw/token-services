const BasicOrderStatistics = {
  required: ['cardNumber', 'bankName', 'branchName'],
  properties: {
    successfulOrderCount: {
      type: 'integer',
      default: 0,
      description: '成功的訂單數量',
    },
    successfulCommentCount: {
      type: 'integer',
      default: 0,
      description: '成功的評語數量',
    },
    failCommentCount: {
      type: 'integer',
      default: 0,
      description: '失敗的評語數量',
    },
    averageOrderTime: {
      type: 'date',
      default: 0,
      description: '平均的訂單交易時間',
    },
  },
};

module.exports = {
  BasicOrderStatistics: {
    properties: {
      id: {
        type: 'integer',
        default: 0,
        description: '銀行卡 Id'
      },
      createdAt: {
        type: 'date',
        default: '12312312312',
        description: '建立時間'
      },
      ...BasicOrderStatistics.properties,
    },
  },
  BasicOrderStatisticses: {
    type: 'array',
    items: {
      type: 'object',
      $ref: '#/definitions/BasicOrderStatistics',
    },
  },
};