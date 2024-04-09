import { fromJS } from 'immutable';
import React, { useState } from 'react';
import DialogWrapper from '~/components/DialogWrapper';
import FeeSettings from '~/components/FormFields/FeeSettings';

const DEFAULT_PAYLOAD = {
  buying: {
    feeType: 1,
    feePercent: 0,
    minFee: 0,
    maxFee: 0,
    steps: [],
  },
  selling: {
    feeType: 1,
    feePercent: 0,
    minFee: 0,
    maxFee: 0,
    steps: [],
  },
};

const EditFeeSettingsDialog = ({
  open,
  isSell,
  dialogType,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState(fromJS(DEFAULT_PAYLOAD));
  const [errors, setErrors] = useState({});

  const onFeeChange = () => {};

  const title = isSell ? '出售手续费' : '购买手续费';

  return (
    <DialogWrapper
      mode='ask'
      open={open}
      title={title}
      onCancel={onCancel}
      onConfirm={onConfirm}>
      <FeeSettings
        errors={errors}
        name={dialogType}
        payload={formData}
        onChange={onFeeChange}
      />
    </DialogWrapper>
  );
};

export default EditFeeSettingsDialog;
