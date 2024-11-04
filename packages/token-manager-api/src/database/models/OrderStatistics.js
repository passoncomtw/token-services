const baseSchema = require("../schemas/baseSchema");

module.exports = (sequelize, DataTypes) => {
  const OrderStatistics = sequelize.define("OrderStatistics", 
    {
      ...baseSchema,
      cardNumber: {
        field: 'card_number',
        type: DataTypes.STRING,
        allowNull: false,
        comment: '銀行卡號',
      },
      successfulOrderCount: {
        field: 'successful_order_count',
        type: DataTypes.INTEGER,
        default: 1,
        comment: '成功的 order 數量',
      },
      successfulCommentsCount: {
        field: 'successful_comments_count',
        type: DataTypes.INTEGER,
        default: 1,
        comment: '成功的 評語 數量',
      },
      failOrderCount: {
        field: 'fail_order_count',
        type: DataTypes.INTEGER,
        default: 1,
        comment: '失敗的 order 數量',
      },
      averageOrderTime: {
        filed: 'average_order_time',
        type: DataTypes.DATE,
        allowNull: false,
        default: 0,
        comment: '平均交易時間',
      },
  }, {
    sequelize,
    tableName: "order_statistics",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  });

  OrderStatistics.associate = function (models) {
    // associations can be defined here
    OrderStatistics.belongsTo(models.User, {
      as: "users",
      foreignKey: 'user_id',
      onDelete: 'CASCADE',
    });
  };
  return OrderStatistics;
};
