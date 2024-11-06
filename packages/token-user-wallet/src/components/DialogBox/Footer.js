import React from 'react';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import colors from '~/theme/color';
import spacing from '~/theme/spacing';

const BUTTON_TEXT = {
  warning: '刷新',
  update: '更新',
  confirm: '确认',
  ask: '确认',
};

const SingleButton = ({ type, onConfirm, styles }) => {
  const buttonText = BUTTON_TEXT[type];

  return (
    <View style={styles.dialogFooter}>
      <TouchableHighlight
        underlayColor='#f5f5f5'
        style={styles.btnPrimary}
        onPress={onConfirm}>
        <Text style={styles.btnPrimaryText}>{buttonText}</Text>
      </TouchableHighlight>
    </View>
  );
};

const DoubleButton = ({
  cancelText,
  confirmText,
  type,
  onConfirm,
  onCancel,
  styles,
}) => {
  const buttonText = !isEmpty(confirmText) ? confirmText : BUTTON_TEXT[type];

  return (
    <View style={styles.dialogFooter}>
      <TouchableHighlight
        underlayColor='#f5f5f5'
        style={styles.btnSecondary}
        onPress={onCancel}>
        <Text style={styles.btnPrimaryText}>{cancelText}</Text>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor='#f5f5f5'
        style={styles.btnPrimary}
        onPress={onConfirm}>
        <Text style={styles.btnPrimaryText}>{buttonText}</Text>
      </TouchableHighlight>
    </View>
  );
};

const RenderFooterType = ({
  type,
  cancelText,
  confirmText,
  onConfirm,
  onCancel,
  styles,
}) => {
  if (type === 'ask') {
    return (
      <DoubleButton
        type={type}
        cancelText={cancelText}
        confirmText={confirmText}
        onConfirm={onConfirm}
        onCancel={onCancel}
        styles={styles}
      />
    );
  } else {
    return <SingleButton type={type} onConfirm={onConfirm} styles={styles} />;
  }
};

const Footer = (props) => {
  return (
    <View style={styles.dialogFooter}>
      <RenderFooterType {...props} styles={styles} />
    </View>
  );
};

Footer.prototype = {
  type: propTypes.string.isRequired,
  onConfirm: propTypes.func.isRequired,
};

export default Footer;

const styles = StyleSheet.create({
  dialogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0,
  },
  btnPrimary: {
    flex: 1,
    paddingTop: spacing.middle,
    paddingBottom: spacing.middle,
    borderBottomLeftRadius: spacing.small,
    borderBottomRightRadius: spacing.small,
  },
  btnPrimaryText: {
    color: colors.secondary,
    textAlign: 'center',
    fontSize: spacing.middle,
  },
  btnSecondary: {
    flex: 1,
    paddingTop: spacing.middle,
    paddingBottom: spacing.middle,
    borderBottomLeftRadius: spacing.small,
    borderBottomRightRadius: spacing.small,
  },
});
