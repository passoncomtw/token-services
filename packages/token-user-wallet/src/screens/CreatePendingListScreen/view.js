import React from "react";
import { StyleSheet, View } from "react-native";
import Hint from "~/components/Hint";
import ViewBox from "~/components/ViewBox";
import icHomeBuy from "~/assets/images/home/icHomeBuy.png";
import icHomeSell from "~/assets/images/home/icHomeSell.png";
import PendingListItem from "./components/PendingListItem";

const CreatePendingListScreen = (props) => {
  const { buy, sell, navigation } = props;
  return (
    <ViewBox fill>
      <PendingListItem
        disabled={buy.size > 0}
        title="我要買"
        icon={icHomeBuy}
        action={() =>
          navigation.navigate("Sell-Create-Pending", { orderType: 0 })
        }
      />
      <PendingListItem
        title="我要賣"
        disabled={sell.size > 0}
        icon={icHomeSell}
        action={() => navigation.navigate("Sell-Create-Pending", { orderType: 1 })}
      />
      <View style={styles.footer}>
        <Hint
          content={[
            "當您的訂單數量較大，或於『交易』頁找不到符合您需求的賣家/買家，您可以選擇掛單交易",
          ]}
        />
      </View>
    </ViewBox>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 68,
  },
});

CreatePendingListScreen.options = {
  topBar: {
    title: {
      text: "新增掛單",
    },
  },
  bottomTabs: {
    visible: false,
  },
};

export default CreatePendingListScreen;
