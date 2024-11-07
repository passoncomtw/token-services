import React, { Fragment } from 'react';
import { Icon } from 'react-native-elements';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Hint from '~/components/Hint';
import Text from '~/components/Text';
import Section from '~/components/Section';
import LabelText from '~/components/LabelText';
import ImageIcon from '~/components/ImageIcon';
import ConfirmButton from '~/components/Button/ConfirmButton';
import {
  PENDING_TYPE_TEXT,
  PENDING_STATUS_TEXT,
  PENDING_STATUS,
  PENDING_TYPE,
} from '~/constants/status.config';
import coinIcon from '~/assets/images/icCoin.png';
import { formatMoney } from '~/utils/formatHelper';
import theme from '~/theme';
import { showDialog } from '~/helper/dialogHelper';

const getCountingText = (count, amount) =>
  `${count} 筆 / ${formatMoney(amount)} e幣`;

const GreyLabelText = (props) => (
  <LabelText
    {...props}
    labelStyle={{ color: theme.colors.greyLight }}
    textStyle={{ color: theme.colors.greyLight }}
  />
);

const Content = (props) => {
  const {
    hide,
    data,
    lockPending,
    startPending,
    deletePending,
    goToDetail,
  } = props;
  if (hide) return <Fragment />;

  const id = data.get('id');
  const type = data.get('type');
  const status = data.get('status');
  const balance = data.get('balance');
  const formatBalance = formatMoney(balance);
  const processCount = data.get('processCount');
  const isBuy = PENDING_TYPE[type] === 'BUY';
  const isProcessing = status === PENDING_STATUS.PROCESSING;

  if (isBuy && status === PENDING_STATUS.CANCELED) {
    showDialog({
      text: '您今日取消交易多次，已取消掛單，請先將進行中的交易完成，以免影響您的權益。',
      confirmText: '知道了',
    });
    return <Fragment />;
  }

  const leftControlBtnText = isProcessing ? '暫停掛單' : '繼續掛單';

  return (
    <Section>
      <View style={styles.topType}>
        <Text h3 color='secondary'>
          {PENDING_TYPE_TEXT[type]}
        </Text>
        <TouchableOpacity onPress={goToDetail}>
          <View style={styles.topTypeAction}>
            <Text
              h5
              color='secondary'
              fontWeight='clear'
              style={styles.topTypeActionText}>
              {PENDING_STATUS_TEXT[status]}
            </Text>
            <Icon
              size={15}
              name='arrow-forward-ios'
              color={theme.colors.grey}
            />
          </View>
        </TouchableOpacity>
      </View>
      <LabelText
        label={
          <View style={styles.labelAmountContainer}>
            <Text h5 fontWeight='clear' style={styles.labelAmountText}>
              數量
            </Text>
            <ImageIcon source={coinIcon} size={16} />
            <Text style={styles.labelAmount}>{formatBalance}</Text>
          </View>
        }
        text={`CNY¥ ${formatBalance}`}
      />
      <GreyLabelText
        label='進行中'
        text={getCountingText(processCount, data.get('processAmount'))}
      />
      <GreyLabelText
        label='已取消'
        text={getCountingText(
          data.get('cancelCount'),
          data.get('cancelAmount')
        )}
      />
      <GreyLabelText
        label='已完成'
        text={getCountingText(data.get('doneCount'), data.get('doneAmount'))}
      />
      <GreyLabelText label='剩餘數量' text={`${formatBalance} e幣`} />
      <GreyLabelText showCopy label='掛單編號' text={id} />
      <View style={styles.btnGroup}>
        <ConfirmButton
          type='primary'
          title={leftControlBtnText}
          containerStyle={styles.leftControlBtn}
          onPress={
            isProcessing ? lockPending(id, type) : startPending(id, type)
          }
        />
        <ConfirmButton
          disabled={status !== PENDING_STATUS.PENDING || processCount != 0}
          type='secondary'
          title='刪除掛單'
          containerStyle={styles.rightControlBtn}
          onPress={deletePending(id, type)}
        />
      </View>
      <ConfirmButton
        type='light'
        title='查看訂單'
        onPress={() => false}
      />
      <Hint
        hide={!isBuy}
        content={[
          '剩餘數量低於最小交易量，目前已屏蔽交易，若進行中的交易有釋出擔保數量，系統會繼續交易。若交易均已完成/已取消，您可刪除掛單。',
        ]}
      />
      <Hint
        warning
        hide={!isBuy}
        content={[
          '如欲刪除掛單，請先點擊暫停，待進行中的訂單均結束後即可點擊刪除掛單。',
        ]}
      />
    </Section>
  );
};

const styles = StyleSheet.create({
  topType: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.middle,
  },
  topTypeAction: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  topTypeActionText: {
    paddingRight: theme.spacing.small,
  },
  statusLabel: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeights.bold,
  },
  btnGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  leftControlBtn: {
    width: '50%',
  },
  rightControlBtn: {
    width: '50%',
    marginLeft: theme.spacing.big,
  },
  typeTextStyle: {
    fontWeight: 'normal',
    fontSize: theme.fontSize.h5,
  },
  labelAmountContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelAmountText: {
    color: theme.colors.secondary,
    paddingRight: theme.spacing.small,
  },
  labelAmount: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.secondary,
    paddingLeft: theme.spacing.small,
  },
});

export default Content;
