import React from 'react';
import BuyerContent from './components/BuyerContent';
import SellerContent from './components/SellerContent';
import { ORDER_TYPE } from '~/constants/status.config';

const ConfirmOrderScreen = ({
  componentId,
  handlePaidOrder,
  handleReleaseOrder,
  orderType,
  ...orderInfo
}) => {
  const isSeller = orderType === ORDER_TYPE.SALE;

  // Navigation.mergeOptions(componentId, {
  //   bottomTabs: {
  //     visible: false,
  //   },
  // });

  // useNavigationButtonPress(({ buttonId }) => {
  //   if (buttonId === 'RNN.back') {
  //     showDialog({
  //       type: 'confirm',
  //       text: '交易尚未完成，您確定要離開這頁面嗎？離開後，您可以到訂單頁繼續完成交易，如超時未完成交易將會影響您的之後交易的權益。',
  //       confirmText: '知道了',
  //       action: () => Navigation.popToRoot(componentId),
  //     });
  //   }
  // });

  return isSeller ? (
    <SellerContent
      componentId={componentId}
      orderType={orderType}
      handlePaidOrder={handlePaidOrder}
      {...orderInfo}
    />
  ) : (
    <BuyerContent
      componentId={componentId}
      orderType={orderType}
      handleReleaseOrder={handleReleaseOrder}
      {...orderInfo}
    />
  );
};

ConfirmOrderScreen.options = {
  topBar: {
    backButton: {
      popStackOnPress: false,
    },
  },
};

export default ConfirmOrderScreen;
