import React, { useState } from 'react';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import { object, array } from 'yup';
import Grid from '~/components/Grid';
import DialogWrapper from '~/components/DialogWrapper';
import { ACTIVE_STATUS_ITEMS } from '~/constants/status.config';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';
import { TextInput, RadioGroup, TransferList } from '~/components/FormFields';
import {
  accountSchema,
  passwordSchema,
  userNameSchema,
} from '~/constants/yupSchemas/user';

const initForm = {
  accountId: null,
  name: '',
  account: '',
  password: '',
  status: 1,
  roleList: [],
};

const basicSchema = {
  account: accountSchema,
  name: userNameSchema,
  roleList: array().min(1, '請選擇角色').required('請選擇角色'),
};

const basicAccountSchema = object().shape({
  ...basicSchema,
});

const accountSchemaWithPassword = object().shape({
  ...basicSchema,
  password: passwordSchema,
});

const handleOnChange =
  setFormData =>
  ({ name, value }) => {
    setFormData(formData => ({ ...formData, [name]: value }));
  };

const DetailDialog = ({
  open,
  title,
  selectedId,
  records,
  addAccount,
  editAccount,
  onCancel,
  allRoles,
  onPageChange,
}) => {
  const [formData, setFormData] = useState(initForm);
  const [formError, setErrors] = useState({});

  const onEnter = () => {
    if (isNull(selectedId)) return;

    const selectItem = records.find(
      item => item.get('accountId') === selectedId
    );
    const editData = {
      accountId: selectItem.get('accountId'),
      name: selectItem.get('name'),
      account: selectItem.get('account'),
      status: selectItem.get('status'),
      roleList: selectItem.get('roleList').toJS(),
    };

    setFormData(formData => ({ ...formData, ...editData }));
  };

  const onExited = () => {
    setFormData({ ...initForm });
    setErrors({});
    onCancel();
  };

  const onConfirm = async () => {
    try {
      const hasPassword = !isEmpty(formData.password);
      const schema = hasPassword
        ? accountSchemaWithPassword
        : basicAccountSchema;
      const { password, ...basePayload } = await handleYupSchema(
        schema,
        formData
      );

      const payload = hasPassword ? { ...basePayload, password } : basePayload;
      const onSuccess = () => {
        onPageChange(1);
        onCancel();
      };

      isNull(selectedId)
        ? addAccount({ ...payload, onSuccess })
        : editAccount({ ...payload, onSuccess });
    } catch (error) {
      const errors = handleYupErrors(error);
      setErrors(errors);
    }
  };

  const onChange = handleOnChange(setFormData);

  return (
    <DialogWrapper
      mode='ask'
      open={open}
      maxWidth='sm'
      title={title}
      onEnter={onEnter}
      onExited={onExited}
      onClose={onCancel}
      onConfirm={onConfirm}
    >
      <Grid container>
        <Grid even>
          <TextInput
            title='帳號'
            name='account'
            placeholder='請輸入賬號'
            maxLength={20}
            value={formData.account}
            errorMessage={formError.account}
            onChange={onChange}
          />
        </Grid>
        <Grid even>
          <TextInput
            title='姓名'
            name='name'
            placeholder='請輸入姓名'
            maxLength={20}
            value={formData.name}
            errorMessage={formError.name}
            onChange={onChange}
          />
        </Grid>
        <Grid even>
          <RadioGroup
            title='賬號狀態'
            name='status'
            value={formData.status}
            items={ACTIVE_STATUS_ITEMS}
            onChange={onChange}
          />
        </Grid>
        <Grid even>
          <TextInput
            title='登錄密碼'
            name='password'
            type='password'
            placeholder='請輸入登錄密碼'
            maxLength={20}
            value={formData.password}
            errorMessage={formError.password}
            onChange={onChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TransferList
            title='角色'
            name='roleList'
            onChange={onChange}
            allItems={allRoles}
            selectedItems={formData.roleList}
            errorMessage={formError.roleList}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  );
};

export default DetailDialog;
