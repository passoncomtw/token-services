import React from 'react';
import isNumber from 'lodash/isNumber';
import { Icon } from 'react-native-elements';
import emptyTrade from '~/assets/images/imgEmptyTrade.png';
import EmptyContent from '~/components/EmptyContent';
import { formatMoney } from '~/utils/formatHelper';
import colors from '~/theme/color';
import { ORDER_TYPE } from '~/constants/status.config';

const EMPTY_HINT = [
  {
    hint: ['目前無提供可出售的交易', '您可以使用掛單功能'],
    orderType: ORDER_TYPE.SALE,
  },
  {
    hint: ['目前無提供可購買的交易', '您可以使用掛單功能'],
    orderType: ORDER_TYPE.BUY,
  },
];

const getEmptyContent = ({ searchType, searchAmount }) => {
  const currentType = EMPTY_HINT[searchType];

  if (isNumber(searchAmount)) {
    return {
      hint: [
        `目前無 ${formatMoney(searchAmount)} e幣的交易`,
        '您可以使用掛單功能',
      ],
      orderType: currentType.orderType,
    };
  }

  return currentType;
};

const EmptyTransaction = (props) => {
  const { navigation, searchType, searchAmount } = props;
  const { hint, orderType } = getEmptyContent({ searchType, searchAmount });
  return (
    <EmptyContent
      key="empty-transaction-item"
      hint={hint}
      btnTitle='掛單'
      imageSource={emptyTrade}
      onPress={() => {
        navigation.navigate("Transaction-Create-Pending", { orderType });
      }}
      // onPress={() =>
      //   push('CreatePending', {
      //     passProps: { orderType },
      //   })
      // }
      btnIcon={<Icon name='add' size={30} color={colors.secondary} />}
    />
  );
};

export default EmptyTransaction;
