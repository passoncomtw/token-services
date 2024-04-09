import React from 'react';
import { StyleSheet } from 'react-native';
import { Text as BaseText } from 'react-native-elements';
import theme from '~/theme';

const Text = (props) => {
  const {
    h5,
    h6,
    style,
    color = 'brownGrey',
    fontWeight = 'medium',
    isVisible = true,
  } = props;
  const customPropsStyle = {
    color: theme.colors[color],
    fontWeight: theme.fontWeights[fontWeight],
    // fontFamily: 'Avenir',
  };
  if (!isVisible) return null;
  return (
    <BaseText
      {...props}
      style={StyleSheet.flatten([
        customPropsStyle,
        style && style,
        h5 && StyleSheet.flatten([theme.Text.h5Style]),
        h6 && StyleSheet.flatten([theme.Text.h6Style]),
      ])}
    />
  );
};

export default Text;
