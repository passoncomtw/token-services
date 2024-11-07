import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '~/theme/color';
import Text from '~/components/Text';
import Button from '~/components/Button';
import ImageIcon from '~/components/ImageIcon';
import coinIcon from '~/assets/images/icCoin.png';
import { formatMoney } from '~/utils/formatHelper';

const TRANSACTION_TYPES = [
  { text: '出售', title: '買家', color: colors.secondary },
  { text: '購買', title: '賣家', color: colors.primary },
];

const RowItem = ({ label, children }) => {
  return (
    <View style={styles.inputRow}>
      <Text>{`${label} : `}</Text>
      {children}
    </View>
  );
};

const ListItem = (props) => {
  const {
    id: transactionId,
    user,
    balance,
    bankcard,
    minAmount,
    navigation,
    transactionMinutes,
    type: transactionType,
  } = props;
  const typeContent = TRANSACTION_TYPES[transactionType];

  return (
    <View style={[styles.inputRow, styles.listItem]}>
      <View style={styles.content}>
        <RowItem label='數量'>
          <ImageIcon source={coinIcon} size={16} />
          <Text style={styles.numberValue}>{`${formatMoney(
            minAmount
          )} ~ ${formatMoney(balance)}`}</Text>
        </RowItem>
        <RowItem label='單價'>
          <Text style={styles.contentValue}>{`CNY¥ 1`}</Text>
        </RowItem>
        <RowItem label={typeContent.title}>
          <Text style={styles.contentValue}>{user.name}</Text>
        </RowItem>
      </View>
      <View style={styles.button}>
        <Button
          title={typeContent.text}
          titleStyle={styles.buttonTitleStyle}
          containerStyle={[styles.buttonContainerStyle]}
          buttonStyle={{ backgroundColor: typeContent.color, height: 40 }}
          onPress={() => navigation.navigate("Transaction-Create-Order", {
            text: typeContent.text,
            transactionMinutes,
            transactionType,
            transactionId,
            bankcard,
            minAmount,
            balance,
            user,
          })}
          // onPress={() =>
          //   push('CreateOrder', {
              // text: typeContent.text,
              // transactionMinutes,
              // transactionType,
              // transactionId,
              // bankcard,
              // minAmount,
              // balance,
              // user,
          //   })
          // }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listItem: {
    paddingLeft: 40,
    paddingRight: 25,
    paddingTop: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 0,
    backgroundColor: '#fff',
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  contentValue: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  numberValue: {
    paddingLeft: 8,
    paddingRight: 8,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  content: {
    flex: 1,
  },
  button: {
    width: 80,
    height: 80,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  buttonTitleStyle: {
    fontSize: 14,
    color: '#FFF',
  },
  buttonContainerStyle: {
    width: 80,
    borderRadius: 20,
  },
});

export default ListItem;
