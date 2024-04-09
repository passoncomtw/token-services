import React, { useState } from 'react';
import propTypes from 'prop-types';
import { object, string } from 'yup';
import Grid from '~/components/Grid';
import DialogWrapper from '~/components/DialogWrapper';
import TextInput from '~/components/FormFields/TextInput';
import { handleYupSchema, handleYupErrors } from '~/utils/formCheck';

const rolesSchema = object().shape({
  name: string('不是正確的文字格式')
    .max(20, '角色名稱不得超過20個字元')
    .required('請輸入角色名稱'),
  markup: string('不是正確的文字格式')
    .max(200, '説明不得超過200個字元')
    .required('請輸入説明'),
});

const DetailDialog = props => {
  const [errors, setErrors] = useState({});
  const {
    payload,
    onCancel,
    onAddConirm,
    onEditConfirm,
    dialogType,
    setPayload,
  } = props;
  const onChange = ({ name, value }) => {
    setPayload(p => ({ ...p, [name]: value }));
  };

  const handleOnConfirm = async () => {
    try {
      await handleYupSchema(rolesSchema, payload);

      dialogType === 'ADD' ? onAddConirm() : onEditConfirm();
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
      mode='ask'
      maxWidth='md'
      open={['ADD', 'EDIT'].includes(dialogType)}
      onClose={handleOnCancel}
      onExited={handleOnCancel}
      onConfirm={handleOnConfirm}
      title={dialogType === 'ADD' ? '新增角色' : '角色信息'}
    >
      <Grid container>
        <Grid even>
          <TextInput
            title='角色名稱'
            id='name'
            name='name'
            value={payload.name}
            maxLength={16}
            placeholder='請輸入角色名稱'
            errorMessage={errors.name}
            onChange={onChange}
          />
        </Grid>
        <Grid even>
          <TextInput
            title='説明'
            id='markup'
            name='markup'
            value={payload.markup}
            maxLength={32}
            placeholder='請輸入説明'
            errorMessage={errors.markup}
            onChange={onChange}
          />
        </Grid>
        {/* <Grid xs={12}>
          <TreeView
            title='權限'
            name='permissionList'
            selected={payload.permissionList}
            permissionTree={permissionTree}
            onChange={onChange}
            childrenIdsByParentId={childrenIdsByParentId}
            errorMessage={errors.permissionList}
          />
        </Grid> */}
      </Grid>
    </DialogWrapper>
  );
};

DetailDialog.propTypes = {
  payload: propTypes.object,
  selectIndex: propTypes.oneOfType([propTypes.oneOf([null]), propTypes.number]),
};

export default DetailDialog;
