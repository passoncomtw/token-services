module.exports = {
  Pagenation: {
    page: {
      type: 'integer',
      default: 0,
      description: '頁數'
    },
    size: {
      type: 'integer',
      default: 10,
      description: '每頁數量',
    },
  },
};