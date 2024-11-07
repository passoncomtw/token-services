import React, { useEffect } from "react";
import { RefreshControl, StyleSheet } from "react-native";
import { Icon } from 'react-native-elements';
import colors from '~/theme/color';
import ScrollViewBox from "~/components/ScrollViewBox";
import ConfirmButton from '~/components/Button/ConfirmButton';
import EmptyPending from "./components/EmptyPending";
import Content from "./components/Content";

const PendingScreen = (props) => {
  const {
    buy,
    sell,
    navigation,
    handleGetPendingOrder,
    handleLockPendingOrder,
    handleStartPendingOrder,
    handleDeletePendingOrder,
  } = props;
  useEffect(() => {
    handleGetPendingOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasBuy = buy.size > 0;
  const hasSell = sell.size > 0;

  if (!hasBuy && !hasSell) {
    return (
      <EmptyPending
        onPress={() => navigation.navigate("Sell-Create-Pending-List")}
      />
    );
  }

  const lockPending = (id, type) => () => {
    const payload = { id, type };
    handleLockPendingOrder(payload);
  };

  const deletePending = (id, type) => () => {
    const payload = { id, type };
    handleDeletePendingOrder(payload);
  };

  const startPending = (id, type) => () => {
    const payload = { id, type };
    handleStartPendingOrder(payload);
  };

  return (
    <ScrollViewBox
      scrollViewProps={{
        refreshControl: (
          <RefreshControl
            refreshing={false}
            onRefresh={handleGetPendingOrder}
          />
        ),
      }}
    >
      {[buy, sell].map((d, index) => (
        <Content
          key={`${index}`}
          hide={!d.size > 0}
          data={d}
          lockPending={lockPending}
          startPending={startPending}
          deletePending={deletePending}
          goToDetail={() =>
            navigation.navigate("Sell-Create-Pending", {
              orderType: d.get("type"),
              orderId: d.get("id"),
            })
          }
        />
      ))}
      <ConfirmButton
          type="primary"
          title="新增"
          icon={<Icon name='add' size={30} color={colors.secondary} />}
          onPress={() => navigation.navigate("Sell-Create-Pending-List")}
          containerStyle={styles.buttonStyle}
        />
    </ScrollViewBox>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {paddingLeft: 20, paddingRight: 20},
});

export default PendingScreen;
