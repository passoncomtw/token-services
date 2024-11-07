import React, { useState } from 'react';
import * as yup from 'yup';
import Section from '~/components/Section';
import ScrollViewBox from '~/components/ScrollViewBox';
import PasswordInput from '~/components/Inputs/PasswordInput';
import ConfirmButton from '~/components/Button/ConfirmButton';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import { validate } from '~/utils/yupCheck';
import { PWD_TYPE } from '~/constants/status.config';

import { password, confirmPassword } from '~/utils/yupSchema';

const DEFAULT_PAYLOAD = {
  origin: '',
  password: '',
  confirmPassword: '',
};

const schema = yup.object().shape({
  origin: password,
  password,
  confirmPassword,
});

const handleOnChange =
  ({ setPayload }) =>
  (name) =>
  (value) => {
    const noSpaceValue = value.trim();
    setPayload((p) => ({ ...p, [name]: noSpaceValue }));
  };

const ResetPwdScreen = (props) => {
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [errors, setErrors] = useState(DEFAULT_PAYLOAD);

  const {
    route,
    handleUpdatePwd,
  } = props;

  const { type } = route.params;;

  const isPwd = type === PWD_TYPE.PWD;
  const passwordText = isPwd ? '登錄' : '交易';

  const onChange = handleOnChange({ setPayload });

  const onSubmit = () => {
    const { isValid, errors } = validate(schema, payload);
    setErrors({ ...DEFAULT_PAYLOAD, ...errors });

    if (isValid) {
      handleUpdatePwd({
        payload: {
          type,
          password: payload.origin,
          newPassword: payload.password,
        },
      });
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollViewBox flex fill>
        <Section hideBottomDivider>
          <PasswordInput
            label={`舊${passwordText}密碼`}
            placeholder={`請輸入舊${passwordText}密碼`}
            value={payload.origin}
            errorMessage={errors.origin}
            onChangeText={onChange('origin')}
          />
          <PasswordInput
            label={`新${passwordText}密碼`}
            placeholder={`請輸入新${passwordText}密碼`}
            value={payload.password}
            errorMessage={errors.password}
            onChangeText={onChange('password')}
          />
          <PasswordInput
            label={`再次輸入新${passwordText}密碼`}
            placeholder={`請再次輸入新${passwordText}密碼`}
            value={payload.confirmPassword}
            errorMessage={errors.confirmPassword}
            onChangeText={onChange('confirmPassword')}
          />
        </Section>
        <Section hideBottomDivider>
          <ConfirmButton title='完成' onPress={onSubmit} />
        </Section>
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};

ResetPwdScreen.options = {
  topBar: {
    title: {
      text: '修改密碼',
    },
    backButton: {
      showTitle: false,
    },
  },
  bottomTabs: {
    visible: false,
  },
};

export default ResetPwdScreen;
