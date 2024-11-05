import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import Panel from '~/components/Panels/Panel';
import HeaderBar from '~/components/HeaderBar';
import Pagination from '~/components/TableFields/Pagination';
import Table from './components/Table';
import Button from '~/components/Buttons';
import SearchPanel from './components/SearchPanel';
import { usePagination } from '~/hooks';
import { PanelHeader } from '~/components/Panels';
import EditDialog from './components/EditDialog';
import { DIALOG_MODE } from '~/constants/status.config';

const DEFAULT_PAYLOAD = {
  type: '',
  status: '',
  orderType: '',
  transactionType: '',
  keyWordCondition: 'account',
  keyword: '',
};

const BanksScreen = props => {
  const { list, handleGetList, handleAdd, handleEdit } = props;
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
    action: handleGetList,
    DEFAULT_PAYLOAD,
    hasConditionPayload: true,
  });

  const [dialogType, setDialogType] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const onCancel = () => {
    setDialogType(null);
    setSelectedIndex(null);
  };

  const onAddClick = () => {
    setDialogType(DIALOG_MODE.ADD);
    setSelectedIndex(null);
  };

  const onEditClick = index => () => {
    setDialogType(DIALOG_MODE.EDIT);
    setSelectedIndex(index);
  };

  return (
    <Box m={3}>
      <EditDialog
        items={list}
        dialogType={dialogType}
        selectedIndex={selectedIndex}
        onCancel={onCancel}
        handleAdd={handleAdd}
        handleEdit={handleEdit}
      />
      <HeaderBar title='银行管理' />
      <SearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Panel>
        <PanelHeader
          rightElement={
            <Button text='添加' startIcon={<AddIcon />} onClick={onAddClick} />
          }
        />
        <Table data={list} onEditClick={onEditClick} />
        <Pagination
          size={size}
          page={page}
          totalCount={100}
          totalPageCount={10}
          onSizeChange={onSizeChange}
          onPageChange={onPageChange}
        />
      </Panel>
    </Box>
  );
};

export default BanksScreen;
