const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const { saltHashPassword } = require("../../helpers/utils");

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'users',
    [
      {
        name: 'testuser001',
        account: 'testuser001',
        type: 0,
        email: 'testuser001@abc.ccc',
        phone: '0987654321',
        order_status: 1,
        transaction_status: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        password: saltHashPassword("testuser001a12345678"),
        transaction_code: saltHashPassword("testuser001"),
        referral_code: '0000000001'
      },
      {
        name: 'testuser002',
        account: 'testuser002',
        type: 0,
        email: 'testuser002@abc.ccc',
        phone: '0987654321',
        order_status: 1,
        transaction_status: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        password: saltHashPassword("testuser002a12345678"),
        transaction_code: saltHashPassword("testuser002"),
        referral_code: '0000000002'
      },
      {
        name: 'testuser003',
        account: 'testuser003',
        type: 1,
        email: 'testuser003@abc.ccc',
        phone: '0987654321',
        order_status: 1,
        transaction_status: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        password: saltHashPassword("testuser003a12345678"),
        transaction_code: saltHashPassword("testuser003"),
        referral_code: '0000000003'
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('users', null, {}),
};