import React from 'react';
import { StyleSheet } from 'react-native';
import propTypes from 'prop-types';
import Button from './index';
import theme from '~/theme';

const BACKGROUND_COLOR_MAP = {
  primary: theme.colors.primary,
  secondary: theme.colors.secondary,
  light: theme.colors.greyLighter,
};
const FONT_COLOR_MAP = {
  primary: theme.colors.secondary,
  secondary: theme.colors.white,
  light: theme.colors.secondary,
};

const ConfirmButton = ({
  type = 'primary',
  containerStyle = {},
  onPress = () => false,
  ...props
}) => {
  const styles = StyleSheet.create({
    containerStyle: {
      width: '100%',
      marginBottom: theme.spacing.middle,
    },
    buttonStyle: {
      width: '100%',
      alignSelf: 'center',
      backgroundColor: BACKGROUND_COLOR_MAP[type],
    },
    titleStyle: {
      ...theme.Text.h3Style,
      fontWeight: 'bold',
      color: FONT_COLOR_MAP[type],
    },
  });

  return (
    <Button
      onPress={onPress}
      titleStyle={styles.titleStyle}
      buttonStyle={styles.buttonStyle}
      containerStyle={[styles.containerStyle, containerStyle]}
      {...props}
    />
  );
};

ConfirmButton.propTypes = {
  onPress: propTypes.func,
  containerStyle: propTypes.object,
  type: propTypes.oneOf(['primary', 'secondary', 'light']),
};

export default ConfirmButton;
