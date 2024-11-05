import React, { useState } from 'react';
import propTypes from 'prop-types';
import { object, ref } from 'yup';
import Grid from '~/components/Grid';
import DialogWrapper from '~/components/DialogWrapper';
import TextInput from '~/components/FormFields/TextInput';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';
import { passwordSchema } from '~/constants/yupSchemas/user';

const rolesSchema = object().shape({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema.oneOf(
    [ref('newPassword'), null],
    '與新登錄密碼不一致'
  ),
});

const INIT_FORM_DATA = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const EditPasswordDialog = ({ open, onCancel, onConfirm }) => {
  const [formData, setFormData] = useState({ ...INIT_FORM_DATA });
  const [errors, setErrors] = useState({});

  const onChange = ({ name, value }) => {
    setFormData(p => ({ ...p, [name]: value }));
  };

  const handleOnConfirm = async () => {
    try {
      await handleYupSchema(rolesSchema, formData);
      onConfirm(formData);
      onCancel();
    } catch (error) {
      setErrors(handleYupErrors(error));
    }
  };

  const handleOnCancel = () => {
    onCancel();
    setErrors({});
    setFormData({ ...INIT_FORM_DATA });
  };

  return (
    <DialogWrapper
      mode='ask'
      maxWidth='xs'
      open={open}
      onClose={handleOnCancel}
      onExited={handleOnCancel}
      onConfirm={handleOnConfirm}
      title='修改登入密碼'
    >
      <Grid container>
        <Grid item xs={12}>
          <TextInput
            title='舊登入密碼'
            id='oldPassword'
            name='oldPassword'
            type='password'
            value={formData.oldPassword}
            maxLength={20}
            placeholder='請輸入舊登入密碼'
            errorMessage={errors.oldPassword}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            title='新登入密碼'
            id='newPassword'
            name='newPassword'
            type='password'
            value={formData.newPassword}
            maxLength={20}
            placeholder='請輸入新登入密碼'
            errorMessage={errors.newPassword}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInput
            title='再次輸入新登入密碼'
            id='confirmPassword'
            name='confirmPassword'
            type='password'
            value={formData.confirmPassword}
            maxLength={20}
            placeholder='請再次輸入新登入密碼'
            errorMessage={errors.confirmPassword}
            onChange={onChange}
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
