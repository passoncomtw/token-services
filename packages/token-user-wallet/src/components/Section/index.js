import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { View, Text, StyleSheet } from 'react-native';
import theme from '~/theme';
import spacing from '~/theme/spacing';

const Section = ({ title, hide, children, ...props }) => {
  const styles = getStyle(theme, props);
  if (hide) return null;

  return (
    <View style={styles.root}>
      {!isEmpty(title) && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};

const getStyle = (theme, props) =>
  StyleSheet.create({
    root: {
      width: '100%',
      paddingTop: spacing.middle,
      paddingHorizontal: spacing.big,
      paddingBottom: spacing.middle,
      borderBottomWidth: props.hideBottomDivider ? 0 : 1,
      borderColor: theme.colors.greyLighter,
    },
    title: {
      fontSize: theme.fontSize.h3,
      fontWeight: 'bold',
      color: theme.colors.black,
      marginBottom: theme.spacing.middle,
    },
  });

export default Section;
