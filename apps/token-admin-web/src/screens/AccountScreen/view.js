import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import AddIcon from '@material-ui/icons/Add';
import Button from '~/components/Buttons';
import { Panel } from '~/components/Panels';
import HeaderBar from '~/components/HeaderBar';
import { Pagination } from '~/components/TableFields';
import DeleteDialog from '~/components/AlertDialogWrapper/DeleteDialog';
import Table from './components/Table';
import SearchPanel from './components/SearchPanel';
import DetailDialog from './components/DetailDialog';
import usePagination from '~/hooks/usePagination';

const DIALOG_TITLE = {
  EDIT: '帳號信息',
  ADD: '新增帳號',
};

const DEFAULT_PAYLOAD = {
  status: '',
  keyword: '',
  keyWordCondition: 'name',
};

const handleOpenDialog =
  (setSelectedId, setDialogType) => (dialogAction, id) => () => {
    setDialogType(dialogAction);
    if (['DELETE', 'EDIT'].includes(dialogAction)) {
      setSelectedId(id);
    }
  };

const getDialogTitle = dialogAction => {
  return DIALOG_TITLE[dialogAction];
};

const AccountScreen = ({
  pages,
  total,
  records,
  allRoles,
  allRoleMap,
  handleGetAction,
  handleAddAction,
  handleUpdateAction,
  handleDeleteAction,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [dialogType, setDialogType] = useState('');

  const {
    onPageChange,
    onSizeChange,
    onReset,
    onSearch,
    queryPayload,
    setQueryPayload,
    page,
    size,
  } = usePagination({
    action: handleGetAction,
    DEFAULT_PAYLOAD,
    hasConditionPayload: true,
  });

  const onDelete = id => event => {
    event.stopPropagation();
    setSelectedId(id);
    setDialogType('DELETE');
  };

  const openDetailDialog = handleOpenDialog(setSelectedId, setDialogType);

  const onCancel = () => {
    setQueryPayload(DEFAULT_PAYLOAD);
    setDialogType('');
    setSelectedId(null);
  };

  const onDeleteConfirm = () => {
    handleDeleteAction({ accountId: selectedId });
    onCancel();
  };

  return (
    <Box p={3}>
      <DeleteDialog
        text='帳號'
        dialogType={dialogType}
        onConfirm={onDeleteConfirm}
        onCancel={onCancel}
      />
      <DetailDialog
        title={getDialogTitle(dialogType)}
        open={['EDIT', 'ADD'].includes(dialogType)}
        records={records}
        onCancel={onCancel}
        selectedId={selectedId}
        addAccount={handleAddAction}
        editAccount={handleUpdateAction}
        allRoles={allRoles}
        onPageChange={onPageChange}
      />
      <HeaderBar
        title='賬號列表'
        variant='h1'
        rightElement={
          <Button
            text='新增賬號'
            startIcon={<AddIcon />}
            onClick={openDetailDialog('ADD', null)}
          />
        }
      />
      <SearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Panel>
        <Table
          data={records}
          openDetailDialog={openDetailDialog}
          onDelete={onDelete}
          allRoleMap={allRoleMap}
        />
        <Pagination
          size={size}
          page={page}
          totalCount={total}
          totalPageCount={pages}
          onPageChange={onPageChange}
          onSizeChange={onSizeChange}
        />
      </Panel>
    </Box>
  );
};

export default AccountScreen;
