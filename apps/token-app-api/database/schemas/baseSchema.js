const { Sequelize ,DataTypes } = require('sequelize');

module.exports = {
  createdAt: {
    filed: 'created_at',
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    get() {
      const rawValue = this.getDataValue('createdAt');
      return rawValue ? rawValue.getTime() : null;
    }
  },
  updatedAt: {
    filed: 'updated_at',
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
    get() {
      const rawValue = this.getDataValue('updatedAt');
      return rawValue ? rawValue.getTime() : null;
    }
  },
  deletedAt: {
    filed: 'deleted_at',
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    get() {
      const rawValue = this.getDataValue('deletedAt');
      return rawValue ? rawValue.getTime() : null;
    }
  },
};