import React, { useEffect, useState } from 'react';
import isFunction from 'lodash/isFunction';
import { StyleSheet, View, Text } from 'react-native';
import { useInterval } from '~/helper/commonHelper';
import { getCountDown, isBeforeNow } from '~/helper/dateHelper';
import theme from '~/theme';
import Hint from '../Hint';

const TerminatedLabel = ({ message }) => {
  return <Hint warning content={[message]} />;
};

const CountingLabel = ({
  styles,
  label,
  expiredDate,
  callback,
  showDialog,
  setIsTerminated,
}) => {
  const [durationText, setDurationText] = useState('');

  useInterval(() => {
    const { termination, text } = getCountDown(expiredDate);

    if (termination && showDialog && isFunction(callback)) callback();

    setIsTerminated(termination);
    setDurationText(text);
  }, 1000);

  return (
    <View style={styles.root}>
      <View style={styles.label}>{label}</View>
      <Text style={styles.duration}>{durationText}</Text>
    </View>
  );
};

const CountDownLabel = ({ label, expiredDate, message, callback, status }) => {
  const [isTerminated, setIsTerminated] = useState(true);
  const [showDialog, setShowDialog] = useState(true);
  const styles = getStyle(theme);

  useEffect(() => {
    const terminated = status !== 0;
    setShowDialog(isBeforeNow(expiredDate));
    setIsTerminated(terminated);
  }, [expiredDate, status]);

  return isTerminated ? (
    <TerminatedLabel styles={styles} message={message} />
  ) : (
    <CountingLabel
      styles={styles}
      label={label}
      callback={callback}
      showDialog={showDialog}
      expiredDate={expiredDate}
      setIsTerminated={setIsTerminated}
    />
  );
};

const getStyle = (theme) =>
  StyleSheet.create({
    root: {
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.middle,
    },
    label: {},
    duration: {
      color: theme.colors.error,
    },
  });

export default CountDownLabel;
