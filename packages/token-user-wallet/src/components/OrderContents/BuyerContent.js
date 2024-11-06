import React from 'react';
import { Text } from 'react-native';
import LabelText from '~/components/LabelText';
import Hint from '~/components/Hint';
import ScrollViewBox from '~/components/ScrollViewBox';
import CollapseBox from '~/components/CollapseBox';
import ConfirmButton from '~/components/Button/ConfirmButton';
import Section from '~/components/Section';
import CountDownLabel from '~/components/CountDownLabel';
import { showDialog } from '~/helper/dialogHelper';
import { formatMoney } from '~/utils/formatHelper';
import { formatDateTimeWithSecond } from '~/helper/dateHelper';

const Footer = (props) => {
  const {
    order,
    authUserId,
    pendingOrder,
    onPaidOrder,
    onApplyOrder,
  } = props;

  if (pendingOrder.user.id !== authUserId && order.user.id !== authUserId) {
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
        // onPress={() => showCancelOrderModal({ orderId })}
        />
        <ConfirmButton title='聯繫客服' type='light' />
      </Section>
    );
    
  }

  if (order.status === 1) {
    if (order.isOwner) {
      return (
        <Section hideBottomDivider>
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
          title='放行'
          onPress={onApplyOrder}
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
};

const BuyerContent = (props) => {
  const {
    order,
    authUserId,
    pendingOrder,
    title,
    finishAt,
    handlePaidOrder,
    handleReleaseOrder,
  } = props;

  const callback = () => {
    showDialog({
      text: '如您尚未收到款項，請聯繫客服',
      confirmText: '知道了',
    });
  };

  const onPaidOrder = () => {
    handlePaidOrder({
      orderId: order.id,
    });
  };

  const onApplyOrder = () => {
    handleReleaseOrder({ orderId: order.id, onSuccess: () => false });
  };

  return (
    <ScrollViewBox fill flex>
      <Text>買幣掛單</Text>
      <Section title={title}>
        <CountDownLabel
          label={
            <Text>{`預計將在 ${order.transactionMinutes} 分鐘內收到買家付款`}</Text>
          }
          message='如您尚未收到款項，請聯繫客服'
          expiredDate={new Date(finishAt)}
          callback={callback}
        />
        <LabelText
          label='賣家暱稱'
          text={order.user.name}
          showCopy
        />
        <LabelText
          label='訂單狀態'
          text={order.status}
          showCopy
        />
        <LabelText
          label='收款金額'
          text={`¥ ${formatMoney(order.amount)}`}
          showCopy
        />
        <LabelText label='數量' text={`${formatMoney(order.amount)} e幣`} />
        <Hint warning content={['請到您的交易賬户確認到賬']} />
      </Section>
      <CollapseBox title='收款信息'>
        <LabelText label='買家暱稱' text={pendingOrder.user.name} />
        <LabelText label='買家姓名' text={pendingOrder.bankcard.name} />
        <LabelText
          label='買家銀行'
          text={pendingOrder.bankcard.bank.bankName}
        />
        <LabelText
          label='買家交易賬户'
          text={pendingOrder.bankcard.cardNumber}
        />
      </CollapseBox>
      <CollapseBox title='訂單信息' hideBottomDivider>
        <LabelText label='訂單編號' text={order.id} showCopy />
        <LabelText
          label='訂單成立時間'
          text={formatDateTimeWithSecond(order.createdAt)}
          showCopy
        />
      </CollapseBox>

      <Footer
        order={order}
        authUserId={authUserId}
        pendingOrder={pendingOrder}
        onPaidOrder={onPaidOrder}
        onApplyOrder={onApplyOrder}
      />
    </ScrollViewBox>
  );
};

export default BuyerContent;
