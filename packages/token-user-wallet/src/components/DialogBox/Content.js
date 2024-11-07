import React from 'react';
import propTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';
import { fontSize } from '~/theme/font';

const Content = ({ descript }) => (
  <View style={styles.dialogBody}>
    <Text style={styles.dialogText}>{descript}</Text>
  </View>
);

Content.propTypes = {
  descript: propTypes.string.isRequired,
};

export default Content;

const styles = StyleSheet.create({
  dialogBody: {
    justifyContent: 'center',
    padding: spacing.big,
  },
  dialogText: {
    fontSize: fontSize.h4,
    color: colors.black,
    textAlign: 'center',
    lineHeight: 30,
  },
});
