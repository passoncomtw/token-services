const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'banks',
    [
      {
        bank_name: '中國農業銀行',
        bank_code: 'CDC',
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bank_name: '中國興業銀行',
        bank_code: 'CEC',
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        bank_name: '中國商業銀行',
        bank_code: 'CDD',
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('banks', null, {}),
};