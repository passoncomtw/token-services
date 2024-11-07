import React, { Fragment } from 'react';
import { Text, StyleSheet } from 'react-native';
import isEmpty from 'lodash/isEmpty';
import theme from '~/theme';

const ErrorMessage = ({ errorMessage }) => {
  if (isEmpty(errorMessage)) return <Fragment />;

  return (
    <Fragment>
      <Text style={styles.text}>{errorMessage}</Text>
    </Fragment>
  );
};

const styles = StyleSheet.create({
  text: {
    color: theme.colors.error,
    padding: 6,
    paddingLeft: 0,
    fontSize: theme.fontSize.h6,
  },
});

export default ErrorMessage;
