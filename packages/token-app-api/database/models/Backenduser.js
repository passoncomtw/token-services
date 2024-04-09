const baseSchema = require("../schemas/baseSchema");
const { saltHashPassword } = require('../../helpers/utils');

module.exports = (sequelize, DataTypes) => {
  const Backenduser = sequelize.define("Backenduser",
    {
      ...baseSchema,
      account: {
        filed: 'account',
        type: DataTypes.STRING,
        require: true,
        allowNull: false,
        length: 50,
      },
      status: {
        filed: 'status',
        type: DataTypes.ENUM([0, 1]),
        require: true,
        defaultValue: 1,
        allowNull: false,
      },
      name: {
        filed: 'name',
        type: DataTypes.STRING,
        require: true,
        allowNull: false,
        length: 50,
      },
      password: {
        filed: 'password',
        type: DataTypes.STRING,
        require: true,
        allowNull: false,
        length: 200,
        set(value) {
          this.setDataValue('password', saltHashPassword(value));
        }
      },
    }, {
    sequelize,
    tableName: "backend_users",
    timestamps: false,
    underscored: true,
    freezeTableName: true,
  });

  Backenduser.associate = function (models) {
    Backenduser.belongsTo(models.Backendactor, {
      as: "backendactor",
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      foreignKey: 'actor_id'
    });
  };

  return Backenduser;
};
