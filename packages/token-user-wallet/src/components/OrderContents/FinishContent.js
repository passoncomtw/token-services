import React from 'react';
import LabelText from '~/components/LabelText';
import Hint from '~/components/Hint';
import Section from '~/components/Section';
import ScrollViewBox from '~/components/ScrollViewBox';
import ConfirmButton from '~/components/Button/ConfirmButton';
import { formatMoney, getBankTitle } from '~/utils/formatHelper';
import { formatDateTimeWithSecond } from '~/helper/dateHelper';

const FinishContent = (props) => {
  const { order } = props;
  return (
    <ScrollViewBox fill flex>
      <Section>
        <LabelText
          label='付款金額'
          text={`¥ ${formatMoney(order.amount)}`}
          showCopy
        />
        <LabelText label='數量' text={`${formatMoney(order.amount)} e幣`} />
        <LabelText
          label='交易賬户'
          text={getBankTitle(order.bankcard.bank.name, order.bankcard.cardNumber)}
        />
        <Hint content={['請到您的交易賬户確認到賬']} warning />
      </Section>

      <Section title='付款信息'>
        <LabelText label='買家暱稱' text={order.user.name} showCopy />
      </Section>
      <Section title='訂單信息'>
        <LabelText label='訂單編號' text={order.id} showCopy />
        <LabelText
          label='訂單成立時間'
          text={formatDateTimeWithSecond(order.createdAt)}
          showCopy
        />
      </Section>
      <Section hideBottomDivider>
        <ConfirmButton title='聯繫客服' type='light' />
      </Section>
    </ScrollViewBox>
  );
};

export default FinishContent;
