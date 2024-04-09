import { Typography } from '@material-ui/core';
import React from 'react';
import AlertDialogWrapper from '~/components/AlertDialogWrapper';

export const DeleteAlert = props => {
  const { items, onCancel, selectedIndex, handleDeleteAccount } = props;

  const onConfirm = () => {
    const item = items.get(selectedIndex);
    handleDeleteAccount({ id: item.get('id') });
    onCancel();
  };

  return (
    <AlertDialogWrapper
      open={selectedIndex !== null}
      level='warning'
      confirmText='確認'
      cancelText='取消'
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <Typography>您確定要刪除帳戶嗎？</Typography>
    </AlertDialogWrapper>
  );
};

export default DeleteAlert;
