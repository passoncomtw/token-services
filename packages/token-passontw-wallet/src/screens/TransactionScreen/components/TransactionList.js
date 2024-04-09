import React from "react";
import { FlatList, RefreshControl } from "react-native";
import ListItem from "./ListItem";
import EmptyTransaction from "./EmptyTransaction";
import { ORDER_TYPE } from "~/constants/status.config";

const TransactionList = (props) => {
  const {
    data,
    navigation,
    searchType,
    searchAmount,
    handleGetBuyerList,
    handleGetSellerList,
  } = props;

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.idrr}
      renderItem={({ item }) => <ListItem {...item} navigation={navigation} />}
      ListEmptyComponent={
        <EmptyTransaction
          key="transaction-list-empty"
          navigation={navigation}
          searchType={searchType}
          searchAmount={searchAmount}
        />
      }
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            searchType === ORDER_TYPE.SALE
              ? handleGetSellerList()
              : handleGetBuyerList();
          }}
        />
      }
    />
  );
};
export default TransactionList;
