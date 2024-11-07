const yup = require('yup');

const backendactorPermissonsSchema = yup.object().shape({
  user: yup.object().shape({
    manager: yup.object().shape({
      read: yup.boolean().required('user.manager.read 不可為空'),
    }),
    list: yup.object().shape({
      read: yup.boolean().required('user.list.read 不可為空'),
    }),
    order: yup.object().shape({
      read: yup.boolean().required('user.order.read 不可為空'),
      update: yup.boolean().required('user.order.update 不可為空'),
    }),
    transaction: yup.object().shape({
      read: yup.boolean().required('user.transaction.read 不可為空'),
      update: yup.boolean().required('user.transaction.update 不可為空'),
    }),
    account: yup.object().shape({
      read: yup.boolean().required('user.account.read 不可為空'),
      delete: yup.boolean().required('user.account.delete 不可為空'),
    }),
    user: yup.object().shape({
      read: yup.boolean().required('user.user.read 不可為空'),
      update: yup.boolean().required('user.user.update 不可為空'),
      updateLoginPassword: yup.boolean().required('user.user.updateLoginPassword 不可為空'),
      updateTransactionPassword: yup.boolean().required('user.user.updateTransactionPassword 不可為空'),
      unlock: yup.boolean().required('user.user.unlock 不可為空'),
      buyFee: yup.boolean().required('user.user.buyFee 不可為空'),
      sellFee: yup.boolean().required('user.user.sellFee 不可為空'),
    }),
    bankcard: yup.object().shape({
      read: yup.boolean().required('user.bankcard.read 不可為空'),
      delete: yup.boolean().required('user.bankcard.delete 不可為空'),
    }),
    merchant: yup.object().shape({
      create: yup.boolean().required('user.merchant.create 不可為空'),
    }),
  }),
  transaction: yup.object().shape({
    read: yup.boolean().required('transaction.read 不可為空'),
    cancel: yup.boolean().required('transaction.cancel 不可為空'),
  }),
  order: yup.object().shape({
    read: yup.boolean().required('order.read 不可為空'),
    update: yup.boolean().required('order.update 不可為空'),
  }),
  system: yup.object().shape({
    backenduser: yup.object().shape({
      read: yup.boolean().required('backenduser.read 不可為空'),
      create: yup.boolean().required('backenduser.create 不可為空'),
      delete: yup.boolean().required('backenduser.delete 不可為空'),
    }),
    backendactor: yup.object().shape({
      read: yup.boolean().required('backendactor.read 不可為空'),
      create: yup.boolean().required('backendactor.create 不可為空'),
      delete: yup.boolean().required('backendactor.delete 不可為空'),
    }),
  }),
});

module.exports.backendactorPermissonsSchema = backendactorPermissonsSchema;
