import isEmpty from 'lodash/isEmpty';
import pick from 'lodash/pick';

export const formatMoney = (number) => {
  return new Intl.NumberFormat('nu').format(number);
};

export const getBankTitle = (bankName, cardNumber) => {
  if (isEmpty(bankName)) return '';

  const cardNumberLength = cardNumber.length;
  const lastFiveNo = cardNumber.slice(cardNumberLength - 5, cardNumberLength);

  return `${bankName} (${lastFiveNo})`;
};

export const getFirstText = (text) => {
  return isEmpty(text) ? '' : [...text].shift().toUpperCase();
};

export const parseOrderFormat = (data, currentUserId) => {
  const REVERSED_TYPE = [1, 0];
  const isOwner = data.pendingOrder.user.id === currentUserId;

  const orderInfo = pick(data, [
    'createdAt',
    'finishAt',
    'amount',
    'status',
    'id',
  ]);

  const orderCreatorInfo = pick(data, ['user', 'bankcard']);

  const pendingOrderInfo = pick(data.pendingOrder, [
    'type',
    'user',
    'bankcard',
    'transactionMinutes',
  ]);

  const userInfo = isOwner ? pendingOrderInfo : orderCreatorInfo;
  const targetInfo = isOwner ? orderCreatorInfo : pendingOrderInfo;

  const orderType = isOwner
    ? pendingOrderInfo.type
    : REVERSED_TYPE[pendingOrderInfo.type];

  const order = pick(data, [
    'id',
    'createdAt',
    'finishAt',
    'amount',
    'status',
    'user',
    'bankcard',
    'transactionMinutes',
  ]);

  return {
    isOwner,
    order: {
      ...order,
      isOwner,
      type: REVERSED_TYPE[pendingOrderInfo.type],
    },
    pendingOrder: data.pendingOrder,
    orderUser: orderCreatorInfo,
    orderType,
    status: orderInfo.status,
    orderId: orderInfo.id,
    amount: orderInfo.amount,
    finishAt: orderInfo.finishAt,
    createdAt: orderInfo.createdAt,
    transactionMinutes: pendingOrderInfo.transactionMinutes,
    // 使用者目前的資料
    userInfo: {
      bankName: userInfo.bankcard.bank.bankName,
      branchName: userInfo.bankcard.branchName,
      cardNumber: userInfo.bankcard.cardNumber,
    },
    // 收付對象的資料
    targetInfo: {
      nickname: targetInfo.user.name,
      cardOwner: targetInfo.bankcard.name,
      bankName: targetInfo.bankcard.bank.bankName,
      branchName: targetInfo.bankcard.branchName,
      cardNumber: targetInfo.bankcard.cardNumber,
    },
  };
};
