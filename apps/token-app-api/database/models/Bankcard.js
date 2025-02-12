const baseSchema = require("../schemas/baseSchema");

module.exports = (sequelize, DataTypes) => {
  const Bankcard = sequelize.define("Bankcard",
    {
      ...baseSchema,
      name: {
        filed: 'name',
        type: DataTypes.STRING,
        allowNull: false,
        length: 20,
      },
      cardNumber: {
        field: 'card_number',
        type: DataTypes.STRING,
        allowNull: false,
        comment: '銀行卡號',
      },
      status: {
        field: 'status',
        type: DataTypes.ENUM([0, 1, 2]),
        defaultValue: 1,
        comment: '銀行卡狀態: 0: 凍結, 1: 啟用, 2: 刪除',
        get() {
          const rawValue = this.getDataValue('status');
          return parseInt(rawValue);
        }
      },
      branchName: {
        filed: 'branch_name',
        type: DataTypes.STRING,
        allowNull: false,
        length: 20,
      },
    }, {
    sequelize,
    paranoid: true, //允許軟刪除
    tableName: "bank_cards",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  });

  Bankcard.associate = function (models) {
    // associations can be defined here
    Bankcard.belongsTo(models.User, {
      as: "user",
      foreignKey: 'user_id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Bankcard.belongsTo(models.Bank, {
      as: "bank",
      foreignKey: 'bank_id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Bankcard.hasMany(models.PendingOrder, {
      as: 'bankcards',
      foreignKey: {
        name: "bank_card_id",
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    // User.hasMany(models.Comment, {
    //   foreignKey: 'userId',
    //   as: 'comments',
    //   onDelete: 'CASCADE',
    // });
  };
  return Bankcard;
};
