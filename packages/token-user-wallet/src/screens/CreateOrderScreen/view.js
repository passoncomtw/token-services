import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as yup from 'yup';
import Section from '~/components/Section';
import LabelText from '~/components/LabelText';
import ScrollViewBox from '~/components/ScrollViewBox';
import AmountInput from '~/components/Inputs/AmountInput';
import Selector from '~/components/Selector';
import PasswordInput from '~/components/Inputs/PasswordInput';
import ConfirmButton from '~/components/Button/ConfirmButton';
import AvailableLabel from './components/AvailableLabel';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';
import { validate } from '~/utils/yupCheck';
import { formatMoney } from '~/utils/formatHelper';

const CONTENT_MAP = [
  {
    confirmText: '出售e幣',
    amountPlaceholder: '請輸入出售數量',
    bankPlaceholder: '請選擇收款賬户',
    bankHint: '買方將以您提供的交易賬户進行打款',
    transDeadline: '收款期限',
    orderCreator: '買家暱稱',
  },
  {
    confirmText: '購買e幣',
    amountPlaceholder: '請輸入購買數量',
    bankPlaceholder: '請選擇付款賬户',
    bankHint:
      '賣方將以您提供的交易賬户進行到賬確認，請務必以選擇的交易賬户進行支付，否則不予以放行',
    transDeadline: '付款期限',
    orderCreator: '賣家暱稱',
  },
];

const schema = (balance) =>
  yup.object().shape({
    amount: yup
      .number()
      .typeError('請設置整數金額')
      .integer('請設置整數金額')
      .min(100, '最少出售數量為100')
      .max(balance, `最多出售數量為${balance}`),
    beneficiaryBankcardId: yup
      .number()
      .typeError('交易賬户不可為空')
      .required('交易賬户不可為空'),
    transactionCode: yup.string().required('交易密碼不可為空'),
  });

const handleSetAmount = (setter) => (value) => {
  setter(value);
};

const CreateOrderScreen = (props) => {
  const [cardId, setCardId] = useState({});
  const [amount, setAmount] = useState(0);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const {
    route,
    cardItems,
    componentId,       
    handleAddOrder,    
  } = props;
  const { params = {} } = route;
  const {
    balance,
    minAmount,
    transactionId,
    transactionMinutes,
    user = {},
    transactionType = 0,
  } = params;
  
  const onSubmit = () => {
    const payload = {
      componentId,
      orderId: transactionId,
      beneficiaryBankcardId: cardId,
      amount: parseInt(amount, 10),
      transactionCode: password,
    };

    const { isValid, errors } = validate(schema(balance), payload);
    setErrors(errors);

    if (isValid) {
      handleAddOrder(payload);
    }
  };

  const contentText = CONTENT_MAP[transactionType];

  const onAmountSet = handleSetAmount(setAmount);

  // const amountHint =
  //   transactionType === ORDER_TYPE.BUY
  //     ? [`e幣可用餘額 ${formatMoney(balance)}`]
  //     : [];

  return (
    <KeyboardAvoidingView>
      <ScrollViewBox>
        <Section>
          <AvailableLabel
            label='可交易數量: '
            minAmount={formatMoney(minAmount)}
            maxAmount={formatMoney(balance)}
          />
        </Section>
        <Section>
          <View style={styles.amountInput}>
            <AmountInput
              selectAll
              label='數量'
              value={amount}
              errorMessage={errors.amount}
              placeholder={contentText.amountPlaceholder}
              onChangeText={onAmountSet}
              onPress={() => onAmountSet(balance.toString())}
            />
          </View>
          <LabelText
            label='交易金額'
            text={`CNY¥ ${formatMoney(amount)}`}
            textStyle={styles.amountText}
          />
          <Selector
            disabled={false}
            label='交易賬户'
            value={cardId}
            items={cardItems.map(item => ({value: item.id, label: item.bankName}))}
            onValueChange={setCardId}
          />
          {/* <SelectButton
            label='交易賬户'
            placeholder={contentText.bankPlaceholder}
            value={getBankTitle(card.bankName, card.cardNumber)}
            errorMessage={errors.beneficiaryBankcardId}
            onPress={() => false}
            // onPress={() =>
            //   showCardsListModal({
            //     onSelectCard: setCard,
            //     selectedCard: cardId,
            //   })
            // }
            hint={[contentText.bankHint]}
          /> */}
          <PasswordInput
            label='交易密碼'
            placeholder='請輸入交易密碼'
            value={password}
            errorMessage={errors.transactionCode}
            onChangeText={(value) => setPassword(value)}
          />
          <ConfirmButton title={contentText.confirmText} onPress={onSubmit} />
        </Section>
        <Section title='交易信息' hideBottomDivider>
          <LabelText
            label={contentText.transDeadline}
            text={`${transactionMinutes} 分鐘`}
          />
          <LabelText label={contentText.orderCreator} text={user?.name} />
          <LabelText label='收付方式' text='銀行卡' />
        </Section>
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  amountInput: {
    paddingTop: spacing.small,
  },
  button: {
    padding: 15,
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.tertiary,
  },
});

CreateOrderScreen.options = {
  topBar: {
    backButton: {
      showTitle: false,
    },
  },
};

export default CreateOrderScreen;
