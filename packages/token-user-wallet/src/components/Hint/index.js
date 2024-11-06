import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-elements';
import theme from '~/theme';

const Hint = ({ content, hide, ...props }) => {
  const styles = getStyle(theme, props);

  if (hide) return null;

  return (
    <View style={styles.root}>
      {content.map((text) => {
        return (
          <Text key={text} style={styles.text}>
            {text}
          </Text>
        );
      })}
    </View>
  );
};

const getStyle = (theme, props) =>
  StyleSheet.create({
    root: {
      marginBottom: theme.spacing.small,
      backgroundColor: props.warning
        ? theme.colors.tertiaryBg
        : theme.colors.transparent,
      marginLeft: -1 * theme.spacing.big,
      marginRight: -1 * theme.spacing.big,
      padding: props.inputHint ? 0 : theme.spacing.small,
      paddingLeft: theme.spacing.big,
      paddingRight: theme.spacing.big,
    },
    text: {
      fontSize: theme.fontSize.h6,
      lineHeight: theme.fontSize.h3,
      color: props.warning ? theme.colors.tertiary : theme.colors.brownGrey,
    },
  });

export default Hint;
