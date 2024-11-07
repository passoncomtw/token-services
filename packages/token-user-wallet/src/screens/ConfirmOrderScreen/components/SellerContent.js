import React from 'react';
import ViewBox from '~/components/ViewBox';
import BaseSellerContent from '~/components/OrderContents/SellerContent';

const SellerContent = ({
  componentId,
  transactionId,
  handlePaidOrder,
  finishAt,
  user,
  amount,
  bankcard,
  createdAt,
  paymentCard,
  pendingOrder,
}) => {
  // const updateTopBarTitle = (text) => {
  //   Navigation.mergeOptions(componentId, {
  //     topBar: { title: { text } },
  //     bottomTabs: { visible: false },
  //   });
  // };

  return (
    <ViewBox fill flex>
      <BaseSellerContent
        title='付款给卖家'
        user={user}
        amount={amount}
        bankcard={bankcard}
        finishAt={finishAt}
        createdAt={createdAt}
        paymentCard={paymentCard}
        pendingOrder={pendingOrder}
        transactionId={transactionId}
        handlePaidOrder={handlePaidOrder}
        updateTopBarTitle={updateTopBarTitle}
      />
    </ViewBox>
  );
};

export default SellerContent;
