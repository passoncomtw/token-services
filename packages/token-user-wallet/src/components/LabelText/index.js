import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import Toast from 'react-native-toast-message';
import { Icon } from 'react-native-elements';
import { StyleSheet, View, Text } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Button from '../Button';
import colors from '~/theme/color';
import theme from '~/theme';

const CopyButton = ({ showCopy, styles, content }) => {
  if (!showCopy) return <Fragment />;

  return (
    <Button
      icon={<Icon name='content-copy' size={18} color={colors.grey} />}
      type='clear'
      buttonStyle={styles.copy}
      onPress={async () => {
        await Clipboard.setStringAsync(content);
        Toast.show({
          type: 'success',
          text1: '已复制',
        });
      }}
    />
  );
};

const LabelText = ({
  label = '',
  text = '',
  showCopy = false,
  labelStyle = {},
  textStyle = {},
}) => {
  const styles = getStyles(theme, showCopy);

  return (
    <View style={styles.root}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <View style={styles.text}>
        <Text
          numberOfLines={1}
          ellipsizeMode='tail'
          style={[styles.textStyle, textStyle]}>
          {text}
        </Text>
        <CopyButton showCopy={showCopy} content={text} styles={styles} />
      </View>
    </View>
  );
};

LabelText.propTypes = {
  labelStyle: propTypes.shape(),
  textStyle: propTypes.shape(),
  showCopy: propTypes.bool,
};

const getStyles = (theme, showCopy) => {
  return StyleSheet.create({
    root: {
      width: '100%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: showCopy ? theme.spacing.small : theme.spacing.middle,
      justifyContent: 'space-between',
    },
    copy: {
      padding: 0,
      paddingLeft: 10,
      height: 18,
    },
    label: {
      fontSize: theme.Text.h5Style.fontSize,
      color: colors.secondary,
    },
    textStyle: {
      maxWidth: 170,
    },
    text: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      maxHeight: 26,
      fontSize: theme.Text.h5Style.fontSize,
    },
  });
};

export default LabelText;
