import React, { useState, Fragment } from 'react';
import isEmpty from 'lodash/isEmpty';
import { View } from 'react-native';
import TextInputField from './TextInputField';
import EyeIconButton from '~/components/Button/EyeIconButton';
import colors from '~/theme/color';

const PasswordInput = (props) => {
  const { hide, value, errorMessage, label, placeholder } = props;
  const [showPassword, setShowPassword] = useState(false);

  if (hide) return <Fragment />;

  return (
    <View>
      <TextInputField
        label={label}
        placeholder={placeholder}
        maxLength={20}
        secureTextEntry={!showPassword}
        defaultValue={value}
        rightIcon={
          <EyeIconButton
            hidden={isEmpty(value)}
            showContent={showPassword}
            onEyePress={() => setShowPassword(!showPassword)}
            eyeColor={colors.grey}
          />
        }
        errorMessage={errorMessage}
        {...props}
      />
    </View>
  );
};

export default PasswordInput;
