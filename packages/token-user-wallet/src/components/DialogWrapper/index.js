import React from 'react';
import propTypes from 'prop-types';
import isFunction from 'lodash/isFunction';
import { View, StyleSheet } from 'react-native';
import Button from '../Button';

const DialogWrapper = ({
  children,
  type = 'confirm',
  onConfirm = () => false,
  onCancel = () => false,
  cancelText = '取消',
  confirmText = '確認',
}) => {  
  const handleOnCancel = () => {
    if (isFunction(onCancel)) onCancel();
    // dismiss();
  };

  const buttonRowStyle =
    type === 'confirm' ? styles.buttonConfirm : styles.buttonAsk;

  return (
    <View style={styles.root}>
      <View style={styles.panel}>
        {children}
        <View style={[styles.buttonRow, buttonRowStyle]}>
          <Button
            isVisible={type === 'ask'}
            type='clear'
            title={cancelText}
            onPress={handleOnCancel}
          />
          <Button type='clear' title={confirmText} onPress={onConfirm} />
        </View>
      </View>
    </View>
  );
};

DialogWrapper.propTypes = {
  type: propTypes.string,
  onConfirm: propTypes.func,
  onCancel: propTypes.func,
  confirmText: propTypes.string,
  cancelText: propTypes.string,
};

const styles = StyleSheet.create({
  root: {
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    width: 270,
    elevation: 4,
    padding: 20,
    borderRadius: 10,
  },
  buttonRow: {
    width: '100%',
    display: 'flex',
    height: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  buttonAsk: {
    justifyContent: 'space-between',
  },
  buttonConfirm: {
    justifyContent: 'center',
  },
});

export default DialogWrapper;
