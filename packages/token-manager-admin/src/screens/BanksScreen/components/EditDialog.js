import React, { useEffect, useState } from 'react';
import DialogWrapper from '~/components/DialogWrapper';
import Grid from '~/components/Grid';
import TextInput from '~/components/FormFields/TextInput';
import SelectInput from '~/components/FormFields/SelectInput';
import { toSearchItems } from '~/utils/format';
import { onChangeHandler } from '~/utils/formUtils';
import { DIALOG_MODE, ACTIVE_STATUS_TEXT } from '~/constants/status.config';

const DEFAULT_PAYLOAD = {
  bankCode: '',
  bankName: '',
  status: 1,
};

const OPEN_MODE = [DIALOG_MODE.ADD, DIALOG_MODE.EDIT];

const EditDialog = props => {
  const { dialogType, items, handleAdd, handleEdit, selectedIndex, onCancel } =
    props;
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);

  const onChange = onChangeHandler(setPayload);

  const onConfirm = () => {
    dialogType === DIALOG_MODE.EDIT ? handleEdit(payload) : handleAdd(payload);
    onCancel();
  };

  useEffect(() => {
    if (dialogType === DIALOG_MODE.EDIT) {
      const currentItem = items.get(selectedIndex);
      setPayload(currentItem.toJS());
    }
    return () => setPayload(DEFAULT_PAYLOAD);
  }, [dialogType]);
  return (
    <DialogWrapper
      mode='ask'
      open={OPEN_MODE.includes(dialogType)}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Grid container>
        <Grid third>
          <TextInput
            title='銀行代碼'
            name='bankCode'
            placeholder='請輸入銀行代碼'
            value={payload.bankCode}
            onChange={onChange}
          />
        </Grid>
        <Grid third>
          <TextInput
            title='銀行'
            name='bankName'
            placeholder='請輸入銀行'
            value={payload.bankName}
            onChange={onChange}
          />
        </Grid>
        <Grid third>
          <SelectInput
            title='銀行狀態'
            name='status'
            value={payload.status}
            items={toSearchItems(ACTIVE_STATUS_TEXT, [])}
            onChange={onChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
      </Grid>
    </DialogWrapper>
  );
};

export default EditDialog;
