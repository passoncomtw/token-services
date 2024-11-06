import React, { useState } from 'react';
import * as yup from 'yup';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { View, StyleSheet } from 'react-native';
import colors from '~/theme/color';
import TextInputField from '../Inputs/TextInputField';
import DialogWrapper from '../DialogWrapper';
import { validate } from '~/utils/yupCheck';

const InputDialog = ({
  componentId,
  type,
  label,
  placeholder,
  onConfirm,
  schema,
  onCancel,
  cancelText,
  confirmText,
}) => {
  const [value, setValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleConfirm = (dismiss) => {
    if (isEmpty(schema)) return onConfirm(value);

    const { isValid, errors } = validate(
      yup.object().shape({ value: schema }),
      { value }
    );

    if (isValid) {
      onConfirm(value);
      dismiss();
    }

    setErrorMessage(errors.value);
  };

  return (
    <DialogWrapper
      componentId={componentId}
      type={type}
      onConfirm={handleConfirm}
      onCancel={onCancel}
      autoDismiss={false}
      cancelText={cancelText}
      confirmText={confirmText}>
      <View style={styles.inputRow}>
        <TextInputField
          label={label}
          value={value}
          placeholder={placeholder}
          errorMessage={errorMessage}
          onChangeText={(value) => setValue(value)}
        />
      </View>
    </DialogWrapper>
  );
};

InputDialog.propTypes = {
  type: propTypes.string,
  message: propTypes.string,
  onConfirm: propTypes.func,
  onCancel: propTypes.func,
  confirmText: propTypes.string,
  cancelText: propTypes.string,
};

InputDialog.defaultProps = {
  type: 'confirm',
  message: '',
  onConfirm: () => false,
  onCancel: () => false,
  confirmText: '确认',
  cancelText: '取消',
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
    padding: 16,
    borderRadius: 10,
  },
  message: {
    textAlign: 'center',
    lineHeight: 25,
    fontSize: 16,
    color: colors.black,
  },
  messageRow: {
    paddingTop: 15,
    paddingBottom: 15,
  },
  buttonRow: {
    width: 140,
    display: 'flex',
    flexDirection: 'row',
  },
  buttonAsk: {
    justifyContent: 'space-between',
  },
  buttonConfirm: {
    justifyContent: 'center',
  },
});

export default InputDialog;
