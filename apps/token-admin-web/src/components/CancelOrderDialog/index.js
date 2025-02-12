import React, { useState } from 'react';
import propTypes from 'prop-types';
import { Box } from '@material-ui/core';
import Radio from '~/components/FormFields/Radio';
import DialogWrapper from '~/components/DialogWrapper';
import TextInput from '~/components/FormFields/TextInput';

const CancelOrderDialog = ({ onCancel, handleConfirm, ...props }) => {
  const [selected, setSelected] = useState('zero');
  const [reason, setReason] = useState('無交易需求');
  const [error, setError] = useState('');

  const onChange = ({ target: { value } }) => {
    switch (value) {
      case 'zero':
        setReason('無交易需求');
        break;
      case 'edit':
        setReason('欲更改訂單內容');
        break;
      default:
        setReason('');
    }

    setSelected(value);
  };

  const onChangeText = ({ value }) => {
    setReason(value);
  };

  const onBlur = () => {
    setError('');
  };

  const onConfirm = () => {
    const isValid = reason.length != 0;

    if (isValid) {
      handleConfirm({ reason });
      onCancel();
    } else {
      setError('取消原因不可為空');
    }
  };

  return (
    <DialogWrapper
      {...props}
      mode='ask'
      maxWidth='xs'
      onConfirm={onConfirm}
      onCancel={onCancel}
      onExited={onCancel}
      title='取消原因'
    >
      <Box display='flex' flexDirection='column'>
        <Radio
          checked={selected === 'zero'}
          value='zero'
          label='無交易需求'
          onChange={onChange}
        />
        <Radio
          checked={selected === 'edit'}
          value='edit'
          label='欲更改訂單內容'
          onChange={onChange}
        />
        <Radio
          checked={selected === 'other'}
          value='other'
          label='其他'
          onChange={onChange}
        />
        <TextInput
          hide={selected != 'other'}
          multiline
          name='reason'
          rowsMin={3}
          maxLength={256}
          onBlur={onBlur}
          placeholder='請輸入取消原因'
          errorMessage={error}
          onChange={onChangeText}
        />
      </Box>
    </DialogWrapper>
  );
};

CancelOrderDialog.propTypes = {
  open: propTypes.bool,
  onClose: propTypes.func,
  onExited: propTypes.func,
  onCancel: propTypes.func,
};

CancelOrderDialog.defaultProps = {
  open: false,
  onCancel: null,
  onClose: () => {},
  onExited: () => {},
};
export default CancelOrderDialog;
