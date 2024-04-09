const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'wallets',
    [
      {
        user_id: 1,
        status: 1,
        useful_balance: 1000000,
        guaranteed_balance: 0,
        freeze_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2,
        status: 1,
        useful_balance: 1000000,
        guaranteed_balance: 0,
        freeze_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 3,
        status: 1,
        useful_balance: 1000000,
        guaranteed_balance: 0,
        freeze_balance: 0,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('wallets', null, {}),
};