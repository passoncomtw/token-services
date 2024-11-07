const baseSchema = require('../schemas/baseSchema');

module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    ...baseSchema,
    status: {
      field: 'status',
      type: DataTypes.ENUM([0, 1]),
      defaultValue: 1,
      comment: '錢包狀態: 0: 凍結, 1: 啟用',
    },
    usefulBalance: {
      filed: 'useful_balance',
      type: DataTypes.DECIMAL(18, 0),
      defaultValue: 0,
      comment: '可用額度',
    },
    guaranteedBalance: {
      filed: 'guaranteed_balance',
      type: DataTypes.DECIMAL(18, 0),
      defaultValue: 0,
      comment: '信用(保證金)額度',
    },
    freezeBalance: {
      filed: 'freeze_balance',
      type: DataTypes.DECIMAL(18, 0),
      defaultValue: 0,
    },
  }, {
    sequelize,
    tableName: "wallets",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  });

  Wallet.associate = function(models) {
    Wallet.belongsTo(models.User, {
      as: "user",
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      foreignKey: {
        name: 'user_id',
      },
    });
  };
  return Wallet;
};