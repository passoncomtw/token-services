const baseSchema = require("../schemas/baseSchema");

module.exports = (sequelize, DataTypes) => {
  const Bank = sequelize.define("Bank",
    {
      ...baseSchema,
      bankName: {
        field: 'bank_name',
        type: DataTypes.STRING,
        allowNull: false,
        comment: '銀行名稱',
      },
      status: {
        field: 'status',
        type: DataTypes.ENUM([0, 1, 2]),
        defaultValue: 1,
        comment: '銀行狀態: 0: 停用, 1: 啟用',
        get() {
          const rawValue = this.getDataValue('status');
          return parseInt(rawValue);
        }
      },
      bankCode: {
        field: 'bank_code',
        type: DataTypes.STRING,
        allowNull: false,
        comment: '銀行代碼',
        length: 10,
      },
    }, {
    sequelize,
    paranoid: true, //允許軟刪除
    tableName: "banks",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  });

  Bank.associate = function (models) {
    // associations can be defined here
    Bank.hasMany(models.Bankcard, {
      as: "bankcard",
      foreignKey: 'bank_id',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };
  return Bank;
};
