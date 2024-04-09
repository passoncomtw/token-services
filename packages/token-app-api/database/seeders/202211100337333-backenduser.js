const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

const { saltHashPassword } = require("../../helpers/utils");

const password = saltHashPassword("admin2021a12345678");

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'backend_users',
    [
      {
        name: 'admin2021',
        account: 'admin2021',
        actor_id: 1,
        status: 1,
        created_at: new Date(),
        updated_at: new Date(),
        password: password,
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('backend_users', null, {}),
};