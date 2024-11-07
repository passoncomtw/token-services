import React, { useState } from 'react';
import * as yup from 'yup';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import ConfirmButton from '~/components/Button/ConfirmButton';
import ViewBox from '~/components/ViewBox';
import PasswordInput from '~/components/Inputs/PasswordInput';
import TextInputField from '~/components/Inputs/TextInputField';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import Icon from '~/components/Icon';
import packageConfig from '../../../package.json';
import { validate } from '~/utils/yupCheck';
import colors from '~/theme/color';
import LOGO from '~/assets/images/logo.png';
import ImageIcon from '~/components/ImageIcon';
import spacing from '~/theme/spacing';

const windowHeight = Dimensions.get('window').height;

const DEFAULT_PAYLOAD = {
  account: '',
  password: '',
  notificationToken: 'abcde', // currently, cannot be empty
};

const schema = yup.object().shape({
  account: yup.string().required('請輸入賬號'),
  password: yup.string().required('請輸入登錄密碼'),
});

const handleOnChange =
  ({ setPayload }) =>
  (name) =>
  (value) => {
    const noSpaceValue = value.trim();
    setPayload((p) => ({ ...p, [name]: noSpaceValue }));
  };

const LoginScreen = ({ showIntroScreen, handleLogin, ...props }) => {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [errors, setErrors] = useState({});

  const onChange = handleOnChange({ setPayload });

  const onPressLogin = () => {
    const { isValid, errors } = validate(schema, payload);

    setErrors(errors);

    if (isValid) {
      handleLogin(payload);
    }
  };

  const onRegistry = () => {
    setErrors({});
    props.navigation.navigate('Registry');
  };

  return (
    <ViewBox flex fill containerStyle={styles.containerStyle}>
      <View style={styles.paddingPanel} />
      <KeyboardAvoidingView>
        <View style={styles.whiteBoard}>
          <View style={styles.logoContainer}>
            <ImageIcon source={LOGO} size={110} />
          </View>
          <TextInputField
            placeholder='請輸入賬號'
            maxLength={20}
            value={payload.account}
            errorMessage={errors.account}
            onChangeText={onChange('account')}
            inputContainerStyle={{ borderWidth: 0 }}
            leftIcon={<Icon name='person' color='greyLight' />}
          />
          <PasswordInput
            placeholder='請輸入登錄密碼'
            maxLength={20}
            value={payload.password}
            errorMessage={errors.password}
            onChangeText={onChange('password')}
            inputContainerStyle={{ borderWidth: 0 }}
            leftIcon={<Icon name='lock' color='greyLight' />}
          />
          <View style={styles.helper}>
            <TouchableOpacity
              disabled
              onPress={() => false}
              // onPress={() => props.navigation.navigate('ResetPWD')}
            >
              <Text>忘記登錄密碼？</Text>
            </TouchableOpacity>
            <TouchableOpacity
              disabled
              onPress={() => false}>
              <Text>24h 客服</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ConfirmButton
              buttonStyle={styles.loginButton}
              title='登錄'
              onPress={onPressLogin}
            />
            <ConfirmButton
              type='secondary'
              buttonStyle={styles.registryButton}
              title='免費註冊'
              onPress={onRegistry}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <Text style={styles.versionText}>version {packageConfig.version}</Text>
    </ViewBox>
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.greyLighter,
    paddingTop: windowHeight * 0.1,
  },
  paddingPanel: {
    top: 0,
    width: '100%',
    height: '45%',
    position: 'absolute',
    backgroundColor: colors.primary,
  },
  whiteBoard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.middle,
    paddingHorizontal: spacing.middle,
  },
  logoContainer: {
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helper: {
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  loginButton: {
    backgroundColor: colors.primary,
  },
  registryButton: {
    backgroundColor: colors.secondary,
  },
  footer: {
    paddingTop: spacing.big,
  },
  versionText: {
    textAlign: 'center',
    color: colors.greyLight,
  },
});

export default LoginScreen;
