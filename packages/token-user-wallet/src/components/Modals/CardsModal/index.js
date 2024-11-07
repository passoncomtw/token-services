import React from 'react';
import { RefreshControl, FlatList } from 'react-native';
import isFunction from 'lodash/isFunction';
import { useDispatch, useSelector } from 'react-redux';
import colors from '~/theme/color';
import Hint from '~/components/Hint';
import CardItem from './components/CardItem';
import ViewBox from '../../ViewBox';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getCardsAction } from '~/actions/cardActions';
import EmptyContent from './components/EmptyContent';

const CardsModal = ({
  componentId,
  selectedCard,
  onSelectCard,
  hasHint = true,
}) => {
  const dispatch = useDispatch();
  const cards = useSelector(({ cards }) => cards);
  const cardItems = cards.get('cards');

  const handleSelectCard = (item) => () => {
    if (isFunction(onSelectCard)) {
      onSelectCard(item);
      // dismiss();
    }
  };

  const onEditClick = (item) => () => {
    // showUpdateCardModal({ cardInfo: item, editMode: 'edit' });
  };

  const sortedItems = cardItems
    .sort((a, b) => b.get('createdAt') - a.get('createdAt'))
    .toJS();

  return (
    <ViewBox fill flex>
      <FlatList
        data={sortedItems}
        keyExtractor={(item) => `item_${item.cardNumber}`}
        style={{ padding: 15 }}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              dispatch(getCardsAction());
            }}
          />
        }
        ListHeaderComponent={
          hasHint && (
            <Hint
              content={[
                '請選擇欲交易的賬户，如需新增或修改，請先至 錢包 > 收付方式 調整後再進行交易',
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
            hide={!cardItems.isEmpty()}
            onPress={() => false}
            // onPress={() =>
            //   showUpdateCardModal({ cardInfo: {}, editMode: 'add' })
            // }
          />
        }
      />
    </ViewBox>
  );
};

MaterialCommunityIcons.getImageSource('plus', 30).then((icon) => {
  CardsModal.options = {
    topBar: {
      backButton: {
        visible: false,
      },
      leftButtons: [
        {
          id: 'CARDS_CANCEL',
          text: '取消',
          fontSize: 16,
        },
      ],
      leftButtonColor: colors.secondary,
      rightButtonColor: colors.secondary,
      title: {
        text: '收付方式',
      },
      rightButtons: [
        {
          id: 'CREATE_CARD',
          icon,
        },
      ],
    },
  };
});

export default CardsModal;
