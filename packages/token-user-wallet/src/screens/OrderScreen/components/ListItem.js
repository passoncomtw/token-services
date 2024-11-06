import React from 'react';
import { StyleSheet, View } from 'react-native';
import Image from '~/components/Image';
import Text from '~/components/Text';
import ViewBox from '~/components/ViewBox';
import LabelText from '~/components/LabelText';
import ImageIcon from '~/components/ImageIcon';
import coinIcon from '~/assets/images/icCoin.png';
import buyIcon from '~/assets/images/order/tagBuy.png';
import sellIcon from '~/assets/images/order/tagSell.png';
import {
  ORDER_STATUE_TEXT,
  ORDER_STATUS_COLOR,
} from '~/constants/status.config';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';
import { fontSize, fontWeight } from '~/theme/font';
import { formatMoney } from '~/utils/formatHelper';
import { formatDateTimeWithSecond } from '~/helper/dateHelper';

const ListItem = (props) => {
  const {
    order,
  } = props;
  const formatAmount = formatMoney(order.amount);
  const tagIcon = order.type === 0 ? buyIcon : sellIcon;

  return (
    <ViewBox style={styles.container}>
      <LabelText
        label={<Image source={tagIcon} style={styles.tagIcon} />}
        text={ORDER_STATUE_TEXT[order.status]}
        textStyle={{ color: ORDER_STATUS_COLOR[order.status] }}
      />
      <LabelText
        label={
          <View style={styles.labelAmountContainer}>
            <ImageIcon source={coinIcon} size={16} />
            <Text style={styles.labelAmount}> {formatAmount}</Text>
          </View>
        }
        text={`CNY¥ ${formatAmount}`}
      />
      <LabelText
        label={order.user.name}
        text={formatDateTimeWithSecond(order.createdAt)}
        labelStyle={styles.userLabel}
        textStyle={styles.userText}
      />
    </ViewBox>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.middle,
    backgroundColor: colors.background,
    marginHorizontal: spacing.middle,
    marginTop: spacing.middle,
    borderRadius: 8,
  },
  labelAmountContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelAmount: {
    paddingLeft: spacing.smallest,
    color: colors.secondary,
    fontSize: fontSize.h3,
    fontWeight: fontWeight.bold,
  },
  tagIcon: { width: 60, height: 35, resizeMode: 'contain' },
  userLabel: {
    color: colors.grey,
  },
  userText: {
    color: colors.grey,
  },
});

export default ListItem;
