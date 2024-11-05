import React from 'react';
import AlertDialogWrapper from '~/components/AlertDialogWrapper';
import Typography from '~/components/Typography';

export const ConfirmDialog = ({ open, text, ...props }) => {
  return (
    <AlertDialogWrapper level='warning' open={open} {...props}>
      <Typography varient='h4'>{text}</Typography>
    </AlertDialogWrapper>
  );
};

export default ConfirmDialog;
