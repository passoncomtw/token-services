const permissions = {
  "user": {
    "manager": {
      "read": true
    },
    "list": {
      "read": true
    },
    "order": {
      "read": true,
      "update": true
    },
    "transaction": {
      "read": true,
      "cancel": true
    },
    "account": {
      "read": true,
      "delete": true
    },
    "user": {
      "read": true,
      "update": true,
      "updateLoginPassword": true,
      "updateTransactionPassword": true,
      "unlock": true,
      "buyFee": true,
      "sellFee": true
    },
    "bankcard": {
      "read": true,
      "delete": true
    },
    "merchant": {
      "create": true
    }
  },
  "transaction": {
    "read": true,
    "cancel": true
  },
  "order": {
    "read": true,
    "update": true
  },
  "system": {
    "backenduser": {
      "read": true,
      "create": true,
      "delete": true
    },
    "backendactor": {
      "read": true,
      "create": true,
      "delete": true
    }
  }
};

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert(
    'backend_actors',
    [
      {
        id: 1,
        name: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
        markup: "後台最大使用者",
        permissions: JSON.stringify(permissions),
      },
    ],
    {},
  ),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('backend_actors', null, {}),
};