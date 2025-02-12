import React, { useState, useEffect } from 'react';
import { Box } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { Panel, PanelHeader } from '~/components/Panels';
import HeaderBar from '~/components/HeaderBar';
import Button from '~/components/Buttons';
import Pagination from '~/components/TableFields/Pagination';
import DeleteDialog from '~/components/AlertDialogWrapper/DeleteDialog';
import Table from './components/Table';
import DetailDialog from './components/DetailDialog';
import { usePagination } from '~/hooks';

const DEFAULT_PAYLOAD = {
  roleId: null,
  name: '',
  markup: '',
};

const RoleScreen = props => {
  const {
    list,
    total,
    pages,
    handleGetList,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleGetPermissionTree,
  } = props;
  const [payload, setPayload] = useState(DEFAULT_PAYLOAD);
  const [dialogType, setDialogType] = useState('');

  useEffect(() => {
    handleGetPermissionTree();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { onPageChange, onSizeChange, page, size } = usePagination({
    action: handleGetList,
    hasSearchBar: false,
  });
  const onDelete = roleId => event => {
    event.stopPropagation();
    setPayload({ roleId });
    setDialogType('DELETE');
  };

  const onDetail = details => () => {
    setPayload(details);
    setDialogType('EDIT');
  };

  const onCancel = () => {
    setPayload(DEFAULT_PAYLOAD);
    setDialogType('');
  };

  const onConfirm = action => () => {
    action(payload);
    onCancel();
  };

  return (
    <Box m={3}>
      <DeleteDialog
        text='角色'
        dialogType={dialogType}
        onConfirm={onConfirm(handleDeleteRole)}
        onCancel={onCancel}
      />
      <DetailDialog
        payload={payload}
        dialogType={dialogType}
        onAddConirm={onConfirm(handleAddRole)}
        onEditConfirm={onConfirm(handleEditRole)}
        onCancel={onCancel}
        setPayload={setPayload}
      />
      <HeaderBar title='角色權限' />
      <Panel>
        <PanelHeader
          rightElement={
            <Button
              startIcon={<AddIcon />}
              text='新增角色'
              onClick={() => setDialogType('ADD')}
            />
          }
        />
        <Table data={list} onDelete={onDelete} onDetail={onDetail} />
        <Pagination
          size={size}
          page={page}
          totalCount={total}
          totalPageCount={pages}
          onSizeChange={onSizeChange}
          onPageChange={onPageChange}
        />
      </Panel>
    </Box>
  );
};

export default RoleScreen;
