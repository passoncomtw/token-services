module.exports = {
  Pagenation: {
    page: {
      type: 'integer',
      default: 0,
      description: '頁數'
    },
    limit: {
      type: 'integer',
      default: 10,
      description: '每頁數量',
    },
  },
};