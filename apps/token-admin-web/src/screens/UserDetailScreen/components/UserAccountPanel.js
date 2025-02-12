import React, { Fragment, useState, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import Panel from '~/components/Panels/Panel';
import Pagination from '~/components/TableFields/Pagination';
import AlertDialogWrapper from '~/components/AlertDialogWrapper';
import AccountsTable from '~/components/TableFields/AccountsTable';
import { useRefreshPagination } from '~/hooks';

const UserAccounts = ({
  show,
  userId,
  refreshCount,
  data,
  handleGetList,
  handleDeleteAccount,
}) => {
  const { onPageChange, onSizeChange, onRefresh, page, size } =
    useRefreshPagination({
      action: handleGetList,
      DEFAULT_PAYLOAD: { userId, page: 1, size: 10 },
      hasConditionPayload: false,
    });

  useEffect(() => {
    if (refreshCount > 0) {
      onRefresh();
    }
  }, [refreshCount]);

  const [selectedIndex, setSelectedIdex] = useState(null);

  const handleDelete = selectedIndex => {
    setSelectedIdex(selectedIndex);
  };

  const onCancelDelete = () => {
    setSelectedIdex(null);
  };

  const onConfirm = () => {
    const item = data.get(selectedIndex);
    handleDeleteAccount({ id: item.get('id') });
    onCancelDelete();
  };

  if (!show) return <Fragment />;

  return (
    <Panel>
      <AlertDialogWrapper
        open={selectedIndex !== null}
        level='warning'
        confirmText='確認'
        cancelText='取消'
        onCancel={onCancelDelete}
        onConfirm={onConfirm}
      >
        <Typography>您確定要刪除帳戶嗎？</Typography>
      </AlertDialogWrapper>
      <AccountsTable isUser data={data} handleDelete={handleDelete} />
      <Pagination
        size={size}
        page={page}
        totalCount={100}
        totalPageCount={10}
        onSizeChange={onSizeChange}
        onPageChange={onPageChange}
      />
    </Panel>
  );
};

export default UserAccounts;
