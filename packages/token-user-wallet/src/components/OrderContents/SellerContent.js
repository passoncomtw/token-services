import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import Hint from '~/components/Hint';
import isFunction from 'lodash/isFunction';
import Section from '~/components/Section';
import LabelText from '~/components/LabelText';
import CollapseBox from '~/components/CollapseBox';
import CountDownLabel from '~/components/CountDownLabel';
import ConfirmButton from '~/components/Button/ConfirmButton';
import { showDialog } from '~/helper/dialogHelper';
import { formatMoney } from '~/utils/formatHelper';
import { formatDateTimeWithSecond, isBeforeNow } from '~/helper/dateHelper';
import ScrollViewBox from '../ScrollViewBox';

const WaitingHint = () => {
  return <Text>付款剩餘時間</Text>;
};

const CompletedHint = () => {
  return <Text>預計將在五分鐘內收到賣家放行</Text>;
};

const TEXT_MAP = [
  {
    text: '待付款',
    hint: <WaitingHint />,
    message: '您已超過付款時間，訂單將被取消，若您已付款，請儘速與客服聯繫',
    callback: () => {
      showDialog({
        text: '您已超過付款時間, 訂單將被取消，若您已付款，請儘速與客服聯繫',
        confirmText: '知道了',
      });
    },
  },
  {
    text: '等待放行',
    hint: <CompletedHint />,
    message: '如您已付款，但尚未收到e幣，請聯繫客服',
    callback: null,
  },
];

const Footer = (props) => {
  const {
    order,
    onPaidOrder,
    onApplyOrder,
  } = props;
  if (order.status === 0) {
    if (order.isOwner) {
      return (
        <Section hideBottomDivider>
          <ConfirmButton
            isVisible
            title='我已付款'
            onPress={onPaidOrder}
          />
          <ConfirmButton
            title='取消訂單'
            type='light'
            onPress={() => false}
          // onPress={() => showCancelOrderModal({ orderId })}
          />
        </Section>
      );   
    }
    return (
      <Section hideBottomDivider>
        <ConfirmButton
          title='取消訂單'
          type='light'
          onPress={() => false}
        />
        <ConfirmButton title='聯繫客服' type='light' />
      </Section>
    );   
  }

  if (order.status === 1) {
    return (
      <Section hideBottomDivider>
        <ConfirmButton
          disabled={!order.isOwner}
          title='已確認到帳'
          onPress={onApplyOrder}
        />
        <ConfirmButton
          title='取消訂單'
          onPress={() => false}
        />
        <ConfirmButton
          title='聯繫客服'
          type='light'
          onPress={() => false}
        />
      </Section>
    );
  }


  return (
    <Section hideBottomDivider>
      <ConfirmButton
        title='回列表'
        type='light'
        onPress={() => false}
      // onPress={() => showCancelOrderModal({ orderId })}
      />
    </Section>
  );
}
const SellerContent = (props) => {
  const {
    order,
    title,
    amount,
    createdAt,
    handlePaidOrder,
    updateTopBarTitle,
    handleReleaseOrder,
  } = props;
  const defaultStep = isBeforeNow(new Date(order.finishAt)) ? 0 : 1;
  const [step, setStep] = useState(defaultStep);

  const { text, hint, message, callback } = TEXT_MAP[step];

  if (isFunction(updateTopBarTitle)) updateTopBarTitle(text);

  const onPaidOrder = () => {
    handlePaidOrder({
      orderId: order.id,
      onSuccess: () => setStep(1),
    });
  };

  const onApplyOrder = () => {
    handleReleaseOrder({ orderId: order.id, onSuccess: () => false });
  };

  return (
    <ScrollViewBox fill flex>
      <Text>賣幣掛單</Text>
      <Section title={title}>
        <CountDownLabel
          label={hint}
          message={message}
          status={order.status}
          callback={callback}
          expiredDate={new Date(order.finishAt)}
        />
        <LabelText
          label='付款金額'
          text={`¥ ${formatMoney(amount)}`}
          showCopy
        />
        <LabelText label='數量' text={`${formatMoney(amount)} e幣`} />
        <LabelText
          label='交易銀行'
          text={order.bankcard.bank.bankName}
        />
        <LabelText
          label='交易賬户'
          text={order.bankcard.cardNumber}
        />
      </Section>
      <CollapseBox title='收款信息'>
        <Hint
          content={[
            '以下為賣方的收款信息，請使用您選擇的交易賬户進行轉賬，否則不予以放行',
          ]}
        />
        <LabelText label='賣家暱稱' text={order.user.name} showCopy />
        <LabelText label='賣家姓名' text={order.bankcard.name} showCopy />
        <LabelText label='開户行' t text={order.bankcard.bankName} showCopy />
        <LabelText label='開户支行' text={order.bankcard.branchName} showCopy />
        <LabelText label='銀行卡卡號' text={order.bankcard.cardNumber} showCopy />
      </CollapseBox>
      <CollapseBox title='訂單信息' hideBottomDivider>
        <LabelText label='訂單編號' text={order.id} showCopy />
        <LabelText
          label='訂單成立時間'
          text={formatDateTimeWithSecond(createdAt)}
          showCopy
        />
      </CollapseBox>
      <Footer
        order={order}
        onPaidOrder={onPaidOrder}
        onApplyOrder={onApplyOrder}
      />
    </ScrollViewBox>
  );
};

export default SellerContent;
