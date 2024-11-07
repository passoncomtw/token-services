import React, { useState } from 'react';
import * as yup from 'yup';
import { View, StyleSheet } from 'react-native';
import ScrollViewBox from '~/components/ScrollViewBox';
import ConfirmButton from '~/components/Button/ConfirmButton';
import TextInputField from '~/components/Inputs/TextInputField';
import KeyboardAvoidingView from '~/components/KeyboardAvoidingView';
import { validate } from '~/utils/yupCheck';
import { username, email as emailSchema } from '~/utils/yupSchema';
import Section from '~/components/Section';

const schema = yup.object().shape({
  name: username,
  email: emailSchema,
});

const handleOnChange =
  ({ setPayload }) =>
  (name) =>
  (value) => {
    const noSpaceValue = value.trim();
    setPayload((p) => ({ ...p, [name]: noSpaceValue }));
  };

const UserScreen = ({ account, userId, name, email, handleUpdateUser }) => {
  const [payload, setPayload] = useState({
    name,
    email,
  });
  const [errors, setErrors] = useState({});

  const onChange = handleOnChange({ setPayload });

  const onSubmit = () => {
    const { isValid, errors } = validate(schema, payload);
    setErrors(errors);

    if (isValid) {
      // handleUpdateUser({ payload: { userId, ...payload }, onSuccess: pop });
      handleUpdateUser({ payload: { userId, ...payload }, onSuccess: () => false });
    }
  };

  return (
    <KeyboardAvoidingView>
      <ScrollViewBox flex fill>
        <Section hideBottomDivider>
          <TextInputField
            disabled
            label='賬號'
            placeholder='請輸入賬號'
            value={account}
          />
          <TextInputField
            label='暱稱'
            placeholder='請輸入暱稱'
            value={payload.name}
            errorMessage={errors.name}
            onChangeText={onChange('name')}
          />
          <TextInputField
            label='郵箱'
            placeholder='請輸入郵箱'
            value={payload.email}
            errorMessage={errors.email}
            onChangeText={onChange('email')}
          />
        </Section>
        <Section hideBottomDivider>
          <View style={styles.footer}>
            <ConfirmButton title='完成' onPress={onSubmit} />
          </View>
        </Section>
      </ScrollViewBox>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingTop: 20,
  },
});

UserScreen.options = {
  topBar: {
    title: {
      text: '個人資料',
    },
    backButton: {
      showTitle: false,
    },
  },
};

export default UserScreen;
