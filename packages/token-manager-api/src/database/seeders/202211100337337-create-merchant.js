const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });
const defaultPercentageFee = JSON.stringify({
  feeType: 0,
  feePercent: 0.6,
  minFee: 0,
  maxFee: 1000,
});

const defaultLadderFee = JSON.stringify([
  { amount: 100, feePercent: 0.1 },
  { amount: 1000, feePercent: 0.5 },
]);
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'merchants',
    [
      {
        user_id: 1,
        telegram: 'tomasdemo001',
        contactor: 'tomasdemo001',
        created_at: new Date(),
        updated_at: new Date(),
        buy_fee_type: 0,
        sell_fee_type: 0,
        buy_percentage_fee: defaultPercentageFee,
        sell_percentage_fee: defaultPercentageFee,
        buy_ladder_fee: defaultLadderFee,
        sell_ladder_fee: defaultLadderFee,
      },
      {
        user_id: 2,
        telegram: 'tomasdemo002',
        contactor: 'tomasdemo002',
        created_at: new Date(),
        updated_at: new Date(),
        buy_fee_type: 1,
        sell_fee_type: 1,
        buy_percentage_fee: defaultPercentageFee,
        sell_percentage_fee: defaultPercentageFee,
        buy_ladder_fee: defaultLadderFee,
        sell_ladder_fee: defaultLadderFee,
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('merchants', null, {}),
};