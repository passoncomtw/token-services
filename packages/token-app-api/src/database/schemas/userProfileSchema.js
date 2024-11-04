const { DataTypes } = require('sequelize');
const baseSchema = require('./baseSchema');

module.exports = {
  ...baseSchema,
  name: {
    filed: 'name',
    type: DataTypes.STRING,
    require: true,
    allowNull: false,
    length: 50,
  },
  email: {
    filed: 'email',
    type: DataTypes.STRING,
    allowNull: false,
    length: 20,
  },
  avatar: {
    filed: 'avatar',
    type: DataTypes.STRING,
    length: 200,
    default: 'http://pic.616pic.com/ys_bnew_img/00/43/00/q1eXx7oG1F.jpg'
  },
};
