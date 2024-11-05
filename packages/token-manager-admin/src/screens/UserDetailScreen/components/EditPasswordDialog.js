import React, { useState } from 'react';
import propTypes from 'prop-types';
import { object } from 'yup';
import Grid from '~/components/Grid';
import DialogWrapper from '~/components/DialogWrapper';
import TextInput from '~/components/FormFields/TextInput';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';
import { passwordSchema } from '~/constants/yupSchemas/user';

const schema = object().shape({
  password: passwordSchema,
});

const EditPasswordDialog = ({ open, type, onCancel, onConfirm }) => {
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const onEnter = () => {
    const newTitle = type === 'auth' ? '登錄' : '交易';
    setTitle(newTitle);
  };

  const handleOnConfirm = async () => {
    try {
      await handleYupSchema(schema, { password });
      onConfirm({ password });
      handleOnCancel();
    } catch (error) {
      setErrors(handleYupErrors(error));
    }
  };

  const handleOnCancel = () => {
    onCancel();
    setErrors({});
    setPassword('');
  };

  return (
    <DialogWrapper
      mode='ask'
      maxWidth='xs'
      open={open}
      onEnter={onEnter}
      onClose={handleOnCancel}
      onExited={handleOnCancel}
      onConfirm={handleOnConfirm}
      title={`更新${title}密碼`}
    >
      <Grid container>
        <Grid item xs={12}>
          <TextInput
            title={`新${title}密碼`}
            id='password'
            name='password'
            type='password'
            value={password}
            maxLength={20}
            placeholder={`請輸入${title}密碼`}
            errorMessage={errors.password}
            onChange={({ value }) => setPassword(value)}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  );
};

EditPasswordDialog.propTypes = {
  open: propTypes.bool,
  onCancel: propTypes.func,
  onSubmit: propTypes.func,
};

export default EditPasswordDialog;
