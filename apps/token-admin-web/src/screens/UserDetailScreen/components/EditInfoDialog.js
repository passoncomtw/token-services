import React, { useState } from 'react';
import Grid from '~/components/Grid';
import { object, mixed } from 'yup';
import DialogWrapper from '~/components/DialogWrapper';
import TextInput from '~/components/FormFields/TextInput';
import SelectInput from '~/components/FormFields/SelectInput';
import { LabelText } from '~/components/FormFields';
import { toSearchItems } from '~/utils/format';
import { ACTIVE_STATUS_TEXT } from '~/constants/status.config';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';
import {
  userNameSchema,
  contactorSchema,
  emailSchema,
  phoneSchema,
  telegramSchema,
} from '~/constants/yupSchemas/user';

const detailSchema = object().shape({
  username: userNameSchema,
  status: mixed().oneOf([0, 1]).required('請選擇會員狀態'),
  contactor: contactorSchema,
  phone: phoneSchema,
  telegram: telegramSchema,
  email: emailSchema,
  transStatus: mixed().oneOf([0, 1], '請選擇交易狀態'),
  pendingStatus: mixed().oneOf([0, 1], '請選擇掛單狀態'),
});

const EditInfoDialog = ({ open, user, onCancel, onConfirm }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const onChange = ({ name, value }) => {
    setFormData(state => ({ ...state, [name]: value }));
  };

  const onEnter = () => {
    setFormData(user);
  };

  const handleOnConfirm = async () => {
    try {
      await handleYupSchema(detailSchema, formData);
      onConfirm(formData);
      handleOnCancel();
    } catch (error) {
      setErrors(handleYupErrors(error));
    }
  };

  const handleOnCancel = () => {
    onCancel();
    setErrors({});
  };

  return (
    <DialogWrapper
      title='編輯會員資料'
      mode='ask'
      open={open}
      onEnter={onEnter}
      onExited={handleOnCancel}
      onCancel={handleOnCancel}
      onConfirm={handleOnConfirm}
    >
      <Grid container>
        <Grid third>
          <LabelText title='帳號' value='edmond' />
        </Grid>
        <Grid third>
          <TextInput
            title='暱稱'
            id='username'
            name='username'
            placeholder='請輸入暱稱'
            value={formData.username}
            errorMessage={errors.username}
            onChange={onChange}
          />
        </Grid>
        <Grid third>
          <SelectInput
            title='會員狀態'
            name='status'
            value={formData.status}
            items={toSearchItems(ACTIVE_STATUS_TEXT, [
              { name: '請選擇...', value: '' },
            ])}
            onChange={onChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid third>
          <TextInput
            title='聯絡人姓名'
            id='contactor'
            name='contactor'
            placeholder='請輸入聯絡人姓名'
            value={formData.contactor}
            errorMessage={errors.contactor}
            onChange={onChange}
          />
        </Grid>
        <Grid third>
          <TextInput
            title='手機號'
            id='phone'
            name='phone'
            placeholder='請輸入手機號'
            value={formData.phone}
            errorMessage={errors.phone}
            onChange={onChange}
          />
        </Grid>
        <Grid third>
          <TextInput
            title='Telegram'
            id='telegram'
            name='telegram'
            placeholder='請輸入Telegram帳號'
            value={formData.telegram}
            errorMessage={errors.telegram}
            onChange={onChange}
            startAdornment='@'
          />
        </Grid>
        <Grid third>
          <TextInput
            title='郵箱'
            id='email'
            name='email'
            placeholder='請輸入郵箱'
            value={formData.email}
            errorMessage={errors.email}
            onChange={onChange}
          />
        </Grid>
        <Grid third>
          <SelectInput
            title='交易狀態'
            name='transStatus'
            value={formData.transStatus}
            items={toSearchItems(ACTIVE_STATUS_TEXT, [
              { name: '請選擇...', value: '' },
            ])}
            onChange={onChange}
            labelProps={{ size: 'sm' }}
            errorMessage={errors.transStatus}
          />
        </Grid>
        <Grid third>
          <SelectInput
            title='掛單狀態'
            name='pendingStatus'
            value={formData.pendingStatus}
            items={toSearchItems(ACTIVE_STATUS_TEXT, [
              { name: '請選擇...', value: '' },
            ])}
            onChange={onChange}
            labelProps={{ size: 'sm' }}
            errorMessage={errors.pendingStatus}
          />
        </Grid>
        <Grid xs={12}>
          <TextInput
            multiline
            title='備註'
            id='remark'
            name='remark'
            placeholder='請輸入備註'
            rows={4}
            maxLength={200}
            value={formData.remark}
            errorMessage={errors.remark}
            onChange={onChange}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  );
};

export default EditInfoDialog;
