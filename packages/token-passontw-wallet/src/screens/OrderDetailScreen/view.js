import React from 'react';
import { View, Text } from 'react-native';
import isEmpty from 'lodash/isEmpty';
import StatusPanel from './components/StatusPanel';
import ViewBox from '~/components/ViewBox';
import FinishContent from '~/components/OrderContents/FinishContent';
import SellerContent from '~/components/OrderContents/SellerContent';
import BuyerContent from '~/components/OrderContents/BuyerContent';

const SwitchContent = (props) => {
  const {
    order,
    authUserId,
    pendingOrder,
    handlePaidOrder,
    handleReleaseOrder,
  } = props;

  if ([2, 3, 4].includes(order.get('status'))) {
    return <FinishContent order={order.toJS()} />;
  }

  if (pendingOrder.get('type') === 0) {
    return (
      <BuyerContent
        {...order.toJS()}
        authUserId={authUserId}
        order={order.toJS()}
        pendingOrder={pendingOrder.toJS()}
        handlePaidOrder={handlePaidOrder}
        handleReleaseOrder={handleReleaseOrder}
      />
    );
  }
  return (
    <SellerContent
      {...order.toJS()}
      authUserId={authUserId}
      order={order.toJS()}
      pendingOrder={pendingOrder.toJS()}
      handlePaidOrder={handlePaidOrder}
      handleReleaseOrder={handleReleaseOrder}
    />
  );

};

const OrderDetailScreen = (props) => {
  const {
    authUserId,
    route,
    orders,
    handlePaidOrder,
    handleReleaseOrder,
  } = props;

  const { params = {} } = route;
  const { orderId } = params;
  const currentOrder = orders.find((order) => order.getIn(["order", "id"]) === orderId);

  if (isEmpty(currentOrder)) return <View><Text>Empty Order</Text></View>;

  const type = currentOrder.get('orderType');

  const status = currentOrder.get('status');
  return (
    <ViewBox fill flex>
      <StatusPanel type={type} status={status} />
      <SwitchContent
        authUserId={authUserId}
        order={currentOrder.get('order')}
        pendingOrder={currentOrder.get('pendingOrder')}
        handlePaidOrder={handlePaidOrder}
        handleReleaseOrder={handleReleaseOrder}
      />
    </ViewBox>
  );
};

export default OrderDetailScreen;
