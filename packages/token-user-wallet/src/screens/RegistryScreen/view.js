import React, { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import * as yup from 'yup';
import { StyleSheet, View } from 'react-native';
import Text from '~/components/Text';
import Button from '~/components/Button';
import ScrollViewBox from '~/components/ScrollViewBox';
import PasswordInput from '~/components/Inputs/PasswordInput';
import TextInputField from '~/components/Inputs/TextInputField';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import { validate } from '~/utils/yupCheck';
import {
  account,
  password,
  referrerCode,
  usernameSchema,
  confirmPassword,
  transactionCode,
  confirmTransactionCode,
} from '~/utils/yupSchema';
import spacing from '~/theme/spacing';
import colors from '~/theme/color';

const DEFAULT_PAYLOAD = {
  name: '',
  account: '',
  email: '',
  password: '',
  confirmPassword: '',
  transactionCode: '',
  confirmTransactionCode: '',
  referrerCode: '',
};

const schema = yup.object().shape({
  name: usernameSchema,
  account,
  email: yup.string().email('錯誤的郵箱格式').required('請輸入郵箱'),
  password,
  confirmPassword,
  transactionCode,
  confirmTransactionCode,
  referrerCode,
});

const handleOnChange =
  ({ setPayload }) =>
  (name) =>
  (value) => {
    const noSpaceValue = value.trim();
    setPayload((p) => ({ ...p, [name]: noSpaceValue }));
  };

const RegistryScreen = ({ handleRegistry, ...props }) => {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [errors, setErrors] = useState({});

  const onChange = handleOnChange({ setPayload });

  const dialog = {
    message: `恭喜您註冊成功！\n趕緊登錄使用您的豐盈錢包吧！`,
    action: () => false,
  };

  const onRegistry = () => {
    const { isValid, errors } = validate(schema, payload);    
    setErrors(errors);

    if (isValid) {
      handleRegistry({
        onSuccess: props.navigation.pop,
        payload,        
        dialog,
      });
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollViewBox flex fill>
        <View style={styles.container}>
          <TextInputField
            label='暱稱'
            placeholder='請輸入暱稱'
            value={payload.name}
            errorMessage={errors.name}
            onChangeText={onChange('name')}
          />
          <TextInputField
            label='賬號'
            placeholder='請輸入賬號'
            value={payload.account}
            errorMessage={errors.account}
            onChangeText={onChange('account')}
          />
          <TextInputField
            label='郵箱'
            placeholder='請輸入郵箱'
            value={payload.email}
            errorMessage={errors.email}
            onChangeText={onChange('email')}
          />
          <PasswordInput
            label='登錄密碼'
            placeholder='請輸入登錄密碼'
            value={payload.password}
            errorMessage={errors.password}
            onChangeText={onChange('password')}
          />
          <PasswordInput
            label='再次輸入登錄密碼'
            placeholder='請再次輸入登錄密碼'
            value={payload.confirmPassword}
            errorMessage={errors.confirmPassword}
            onChangeText={onChange('confirmPassword')}
          />
          <PasswordInput
            label='交易密碼'
            placeholder='請輸入交易密碼'
            value={payload.transactionCode}
            errorMessage={errors.transactionCode}
            onChangeText={onChange('transactionCode')}
          />
          <PasswordInput
            label='再次輸入交易密碼'
            placeholder='請再次輸入交易密碼'
            value={payload.confirmTransactionCode}
            errorMessage={errors.confirmTransactionCode}
            onChangeText={onChange('confirmTransactionCode')}
          />
          <TextInputField
            label='推薦碼（選填）'
            placeholder='請輸入推薦碼'
            value={payload.referrerCode}
            errorMessage={errors.referrerCode}
            onChangeText={onChange('referrerCode')}
          />
          <Button title='完成' onPress={onRegistry} />
          <Text
            h5
            color='error'
            isVisible={!isEmpty(errors)}
            style={styles.errorText}>
            註冊資訊填寫不完整
          </Text>
        </View>
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.middle,
    paddingHorizontal: spacing.big,
  },
  errorText: {
    textAlign: 'center',
    paddingTop: spacing.small,
  },
});

RegistryScreen.options = {
  topBar: {
    title: {
      text: '註冊',
      color: colors.secondary,
    },
    backButton: {
      color: colors.secondary,
      showTitle: false,
    },
    background: {
      color: colors.primary,
    },
  },
};

export default RegistryScreen;
