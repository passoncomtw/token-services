import React from 'react';
import { StyleSheet } from 'react-native';
import { Divider as BasicDivider } from 'react-native-elements';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';

const Divider = () => {
  return <BasicDivider style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    height: 1,
    color: colors.grey,
    marginVertical: spacing.middle,
  },
});

export default Divider;
