const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'bank_cards',
    [
      {
        user_id: 1,
        bank_id: 1,
        name: "tomasdemo001",
        card_number: "1234567890123456",
        status: 1,
        branch_name: '南京分行',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 2,
        bank_id: 2,
        name: "tomasdemo002",
        card_number: "1234567890123458",
        status: 1,
        branch_name: '鹿港分行',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        user_id: 3,
        bank_id: 3,
        name: "tomasdemo003",
        card_number: "1234567890113458",
        status: 1,
        branch_name: '員林分行',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('bank_cards', null, {}),
};