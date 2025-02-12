const database = require("../database/models");

const updateWalletFromUserId  = (userId, query, transaction) => {
    return database.Wallet.update(query, {
        where: {user_id: userId},
        transaction,
    });
};

module.exports.updateWalletFromUserId = updateWalletFromUserId;
