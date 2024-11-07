import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import Tabs from '~/components/Tabs';
import ViewBox from '~/components/ViewBox';
import OrderList from './components/OrderList';
import CategroryGroup from './components/CategroryGroup';
import colors from '~/theme/color';
import {
  ORDER_PROCESS_TEXT,
  ORDER_SUCCESS_TEXT,
  ORDER_CATEGRORY_LIST,
} from '~/constants/status.config';

const OrderScreen = (props) => {
  const [selectedIndex, setSelectIndex] = useState(0);
  const [selectedStatusIndex, setSelectStatusIndex] = useState(0);

  const { route, navigation, ordersList, handleGetOrder } = props;

  useEffect(() => {
    handleGetOrder({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPressCategrory = (index) => {
    setSelectIndex(index);
  };

  const onPressStatus = (index) => {
    setSelectStatusIndex(index);
  };

  const categroryTag = ORDER_CATEGRORY_LIST[selectedIndex];
  const isProcessing = categroryTag === 'PROCCESSING';

  const categrory = isProcessing ? ORDER_PROCESS_TEXT : ORDER_SUCCESS_TEXT;

  return (
    <ViewBox fill flex containerStyle={styles.containerStyle}>
      <CategroryGroup
        selectedIndex={selectedIndex}
        onPressCategrory={onPressCategrory}
      />
      <Tabs
        list={categrory}
        value={selectedStatusIndex}
        onChange={onPressStatus}
      />
      <OrderList
        list={ordersList}
        route={route}
        navigation={navigation}
        categrory={categrory}
        isProcessing={isProcessing}
        handleGetOrder={handleGetOrder}
        selectedStatusIndex={selectedStatusIndex}
      />
    </ViewBox>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.white,
  },
  activeStyle: {
    color: colors.black,
  },
});

export default OrderScreen;
