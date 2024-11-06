import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import ListItem from './ListItem';
import {
  ORDER_PROCCESS_LIST,
  ORDER_SUCCESS_LIST,
  ORDER_PROCCESS_STATUS,
  ORDER_SUCCESS_STATUS,
  ORDER_STATUS,
} from '~/constants/status.config';
import EmptyContent from '~/components/EmptyContent';
import emptyImage from '~/assets/images/order/imgEmptyOrder.png';

const OrderList = (props) => {
  const {
    list,
    route,
    categrory,
    navigation,
    handleGetOrder,
    isProcessing,
    selectedStatusIndex,
  } = props;
  const processCategrory = isProcessing
    ? ORDER_PROCCESS_STATUS
    : ORDER_SUCCESS_STATUS;
  const statusIndexList = isProcessing
    ? ORDER_PROCCESS_LIST
    : ORDER_SUCCESS_LIST;

  const filteredList = list.filter((data) => {
    if (isEmpty(data)) return false;
    const status = data.status;
    const statusTag = ORDER_STATUS[status];

    if (selectedStatusIndex === 0) {
      return statusTag === processCategrory[status];
    }
    return selectedStatusIndex === statusIndexList[statusTag];
  });

  return (
    <FlatList
      data={filteredList}
      keyExtractor={(item, index) => `${item.order.id}-${index}`}
      renderItem={({ item }) => {
        return (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              const isTransaction = /Transaction/.test(route.key);
              isTransaction
                ? navigation.navigate("Transaction-Order-Order-Detail", {orderId: item.order.id})
                : navigation.navigate("Buy-Order-Order-Detail", {orderId: item.order.id});
            }}
            // onPress={() => push('OrderDetail', { orderId: item.orderId })}
          >
            <ListItem categrory={categrory} order={item.order} />
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <EmptyContent imageSource={emptyImage} hint={['無訂單記錄']} />
      }
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={handleGetOrder}
        />
      }
    />
  );
};

export default OrderList;
