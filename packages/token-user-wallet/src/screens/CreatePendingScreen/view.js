import React, { useState, useEffect } from 'react';
import isString from 'lodash/isString';
import { Icon } from 'react-native-elements';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Text from '~/components/Text';
import Hint from '~/components/Hint';
import Section from '~/components/Section';
import Dialog from '~/components/DialogBox';
import Selector from '~/components/Selector';
import LabelText from '~/components/LabelText';
import ScrollViewBox from '~/components/ScrollViewBox';
import AmountInput from '~/components/Inputs/AmountInput';
import ConfirmButton from '~/components/Button/ConfirmButton';
import PasswordInput from '~/components/Inputs/PasswordInput';
import TextInputField from '~/components/Inputs/TextInputField';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import { schema } from './components/schema';
import { validate } from '~/utils/yupCheck';
import { formatMoney, getBankTitle } from '~/utils/formatHelper';
import { PENDING_TYPE, PENDING_TYPE_TEXT } from '~/constants/status.config';
import theme from '~/theme';

const SPLIT_ITEMS = [
  { label: '是', value: true },
  { label: '否', value: false },
];

const EXPIRE_TIME_ITEMS = [
  { label: '10分鐘', value: 10 },
  { label: '15分鐘', value: 15 },
  { label: '20分鐘', value: 20 },
  { label: '25分鐘', value: 25 },
  { label: '30分鐘', value: 30 },
];

const DEFAULT_PAYLOAD = {
  isSplit: true,
  amount: '',
  minAmount: '',
  transactionMinutes: 15,
  balance: '',
  bankcardId: '',
  transactionCode: '',
};

const handleOnChange =
  ({ setPayload }) =>
  (name) =>
  (value) => {
    const noSpaceValue = isString(value) ? value.trim() : value;
    setPayload((p) => ({ ...p, [name]: noSpaceValue }));
  };

const ExpireLabel = ({ onPress }) => (
  <View style={styles.expireLabeContainer}>
    <Text h5 color='secondary'>
      支付時效
    </Text>
    <TouchableOpacity onPress={onPress} style={styles.expireButton}>
      <Icon type='material' name='info' color={theme.colors.error} size={14} />
    </TouchableOpacity>
  </View>
);

const CreatePendingScreen = (props) => {
  const [showDialog, setShowDialog] = useState(false);
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [errors, setErrors] = useState({});

  const {
    route,
    cardItems,
    navigation,
    usefulBalance,
    pendingDetail,
    handleGetCards,
    handleCreatePending,
    handleGetPendingDetail,
  } = props;

  const { params = {} } = route;
  const { orderType, orderId } = params;
  const isDetail = orderId ? true : false;

  useEffect(() => {
    handleGetCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (orderId) {
      handleGetPendingDetail({ id: orderId });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, handleGetPendingDetail]);

  useEffect(() => {
    const details = pendingDetail.toJS();
    const bankcard = details.bankcard;

    setPayload((p) => ({
      ...p,
      ...details,
      bankcardId: bankcard.id,
      amount: details.amount.toString(),
      minAmount: details.minAmount.toString(),
      bankName: bankcard.branchName,
      cardNumber: bankcard.cardNumber,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDetail]);

  const isSell = PENDING_TYPE[orderType] === 'SELL';
  const typeText = PENDING_TYPE_TEXT[orderType];
  const topBarTitle = isDetail ? '詳情' : `掛單/${typeText}`;
  const submitBtnText = `${typeText}e幣`;
  const amountHint = isSell
    ? [`e幣可用餘額 ${formatMoney(usefulBalance)}`]
    : null;

  const transactionTip = isSell
    ? '買方將以您提供的交易賬户進行打款'
    : '賣方將以您提供的交易賬户進行到賬確認，請務必以選擇的交易賬户進行支付，否則不予以放行';

  const onChange = handleOnChange({ setPayload });

  const onSubmit = () => {
    const formattedPayload = {
      ...payload,
      amount: parseInt(payload.amount, 10),
      minAmount: parseInt(payload.minAmount, 10),
    };
    const { isValid, errors } = validate(
      schema(usefulBalance, typeText),
      formattedPayload
      );
    setErrors(errors);

    if (isValid) {
      const isTransaction = /Transaction/.test(route.key);
      const onSuccess = isTransaction
        ? () => navigation.navigate("Transaction-Home")
        : () => navigation.navigate("Sell-Pending");

      handleCreatePending({
        ...formattedPayload,
        type: orderType,
        onSuccess,
      });
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollViewBox>
        <Dialog
          open={showDialog}
          type='confirm'
          descript={`當賣家下單後，買家需於支付時效內完成付款，否則訂單將被自動取消。\n若您要掛單購買e幣，當賣家下單後，您必須於設置的時間內完成付款。但若您是掛單出售e幣，那買家必須於您指定的支付時效內付款。`}
          onConfirm={() => setShowDialog(false)}
        />
        <Section hideBottomDivider>
          <AmountInput
            disabled={isDetail}
            selectAll={isSell}
            label='數量'
            maxLength={7}
            hint={amountHint}
            value={payload.amount}
            keyboardType='number-pad'
            errorMessage={errors.amount}
            onChangeText={onChange('amount')}
            placeholder={`請輸入${typeText}數量`}
            onPress={() =>
              setPayload((p) => ({ ...p, amount: usefulBalance.toString() }))
            }
          />
          <LabelText
            label='交易金額'
            text={`CNY¥ ${formatMoney(payload.amount)}`}
            textStyle={styles.amountText}
            labelStyle={styles.amountLabel}
          />
          <Selector
            disabled={isDetail}
            label='交易賬户'
            value={payload.bankcardId}
            items={cardItems.map(item => ({value: item.id, label: item.bankName}))}
            onValueChange={onChange('bankcardId')}
          />
          <Selector
            disabled={isDetail}
            label='是否拆單'
            hint='當訂單數量較大時，拆單掛單會加速完成交易'
            value={payload.isSplit}
            items={SPLIT_ITEMS}
            onValueChange={onChange('isSplit')}
          />
          <TextInputField
            hidden={!payload.isSplit}
            disabled={isDetail}
            label='最小交易量'
            placeholder='請輸入最小交易量'
            keyboardType='number-pad'
            value={payload.minAmount}
            errorMessage={errors.minAmount}
            onChangeText={onChange('minAmount')}
          />
          <Selector
            disabled={isDetail}
            label={<ExpireLabel onPress={() => setShowDialog(true)} />}
            value={payload.transactionMinutes}
            items={EXPIRE_TIME_ITEMS}
            onValueChange={onChange('transactionMinutes')}
          />
          <PasswordInput
            hide={isDetail}
            label='交易密碼'
            placeholder='請輸入交易密碼'
            value={payload.transactionCode}
            errorMessage={errors.transactionCode}
            onChangeText={onChange('transactionCode')}
          />
          <Hint warning content={['掛單時，人請務必在線']} />
          <ConfirmButton
            isVisible={!isDetail}
            title={submitBtnText}
            onPress={onSubmit}
            containerStyle={styles.confirmButtonStyle}
          />
        </Section>
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  expireLabeContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  expireButton: {
    paddingLeft: theme.spacing.smallest,
  },
  button: {
    padding: theme.spacing.middle,
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: theme.fontSize.h5,
    color: theme.colors.tertiary,
  },
  amountLabel: {
    fontWeight: 'bold',
    fontSize: theme.fontSize.h5,
  },
  confirmButtonStyle: {
    paddingTop: theme.spacing.middle,
  },
  dropdown: {
    margin: 16,
    height: 50,
    borderBottomColor: "gray",
    borderBottomWidth: 0.5,
  },
  icon: {
    marginRight: 5,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});

export default CreatePendingScreen;
