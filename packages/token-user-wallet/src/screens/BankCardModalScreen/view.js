import React from "react";
import { RefreshControl, FlatList } from "react-native";
import isEmpty from "lodash/isEmpty";
import isFunction from "lodash/isFunction";
import Hint from "~/components/Hint";
import CardItem from "./components/CardItem";
import ViewBox from "~/components/ViewBox";
import EmptyContent from "./components/EmptyContent";

const BankCardModalScreen = (props) => {
  const {
    navigation,
    sortedItems,
    selectedCard,
    onSelectCard,
    hasHint = true,
  } = props;
  const handleSelectCard = (item) => () => {
    if (isFunction(onSelectCard)) {
      onSelectCard(item);
    }
  };

  const onEditClick = (item) => () => {
    navigation.navigate("Wallet-Handle-Card-Modal", { cardInfo: item, editMode: 'edit' })
  };

  return (
    <ViewBox fill flex>
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => `item_${item.cardNumber}`}
        style={{ padding: 15 }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={props.handleGetCards} />
        }
        ListHeaderComponent={
          hasHint && (
            <Hint
              content={[
                "請選擇欲交易的賬户，如需新增或修改，請先至 錢包 > 收付方式 調整後再進行交易",
              ]}
            />
          )
        }
        renderItem={({ item }) => {
          return (
            <CardItem
              owner={item.name}
              cardNo={item.cardNumber}
              branch={item.branchName}
              bankName={item.bankName}
              defaultCard={item.id === selectedCard}
              onEdit={onEditClick(item)}
              onPress={handleSelectCard(item)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyContent
            hide={sortedItems.length !== 0}
            onPress={() =>
              navigation.navigate("Wallet-Handle-Card-Modal", {
                cardInfo: {},
                editMode: "add",
              })
            }
          />
        }
      />
    </ViewBox>
  );
};

// MaterialCommunityIcons.getImageSource('plus', 30).then((icon) => {
//   BankCardModalScreen.options = {
//     topBar: {
//       backButton: {
//         visible: false,
//       },
//       leftButtons: [
//         {
//           id: 'CARDS_CANCEL',
//           text: '取消',
//           fontSize: 16,
//         },
//       ],
//       leftButtonColor: colors.secondary,
//       rightButtonColor: colors.secondary,
//       title: {
//         text: '收付方式',
//       },
//       rightButtons: [
//         {
//           id: 'CREATE_CARD',
//           icon,
//         },
//       ],
//     },
//   };
// });

export default BankCardModalScreen;
