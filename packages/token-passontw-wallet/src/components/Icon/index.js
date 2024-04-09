import React from 'react';
import { Icon as BasicIcon } from 'react-native-elements';
import { StyleSheet } from 'react-native';
import colors from '~/theme/color';

const Icon = ({ name, color, containerStyle, ...props }) => {
  return (
    <BasicIcon
      type='material'
      name={name}
      containerStyle={[styles.containerStyle, containerStyle]}
      color={colors[color]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    width: 24,
    height: 24,
  },
});

export default Icon;
