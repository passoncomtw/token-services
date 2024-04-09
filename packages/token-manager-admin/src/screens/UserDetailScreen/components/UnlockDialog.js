import React from 'react';
import AlertDialogWrapper from '~/components/AlertDialogWrapper';
import Typography from '~/components/Typography';

export const UnlockDialog = ({ open, text, onCancel, onConfirm, ...props }) => {
  const handleOnConfirm = () => {
    onConfirm();
    onCancel();
  };

  return (
    <AlertDialogWrapper
      level='warning'
      open={open}
      onCancel={onCancel}
      onExit={onCancel}
      onConfirm={handleOnConfirm}
      {...props}>
      <Typography varient='h4'>您确定要解除锁定吗？</Typography>
    </AlertDialogWrapper>
  );
};

export default UnlockDialog;
