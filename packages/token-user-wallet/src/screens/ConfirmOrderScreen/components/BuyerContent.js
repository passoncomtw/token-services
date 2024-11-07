import React from 'react';
import ViewBox from '~/components/ViewBox';
import BaseBuyerContent from '~/components/OrderContents/BuyerContent';

const BuyerContent = ({
  transactionId,
  handleReleaseOrder,
  finishAt,
  user,
  amount,
  bankcard,
  createdAt,
  paymentCard,
  pendingOrder,
}) => {
  // Navigation.mergeOptions(componentId, {
  //   topBar: { title: { text: '等待到賬' } },
  //   bottomTabs: { visible: false },
  // });

  return (
    <ViewBox fill flex>
      <BaseBuyerContent
        title='等待買家付款'
        user={user}
        amount={amount}
        bankcard={bankcard}
        finishAt={finishAt}
        createdAt={createdAt}
        paymentCard={paymentCard}
        pendingOrder={pendingOrder}
        transactionId={transactionId}
        handleReleaseOrder={handleReleaseOrder}
      />
    </ViewBox>
  );
};

export default BuyerContent;
