import React, { Fragment } from 'react';
import { Icon } from 'react-native-elements';
import { TouchableOpacity } from 'react-native';

const EyeIconButton = ({ hidden, onEyePress, showContent, eyeColor }) => {
  if (hidden) return <Fragment />;

  const IconName = showContent ? 'eye' : 'eye-off';
  return (
    <TouchableOpacity activeOpacity={0.5} onPress={onEyePress}>
      <Icon name={IconName} type='material-community' color={eyeColor} />
    </TouchableOpacity>
  );
};

export default EyeIconButton;
