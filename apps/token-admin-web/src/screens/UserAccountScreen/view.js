import React, { useState } from 'react';
import { Box } from '@material-ui/core';
import Panel from '~/components/Panels/Panel';
import HeaderBar from '~/components/HeaderBar';
import Pagination from '~/components/TableFields/Pagination';
import AccountsTable from '~/components/TableFields/AccountsTable';
import SearchPanel from './components/SearchPanel';
import { usePagination } from '~/hooks';
import DeleteAlert from './components/DeleteAlert';

const DEFAULT_PAYLOAD = {
  account: '',
  keyWordCondition: 'username',
  keyword: '',
  page: 1,
  size: 10,
};

const UserAccountScreen = ({ handleGetList, handleDeleteAccount, list }) => {
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
  const [selectedIndex, setSelectedIdex] = useState(null);

  const handleDelete = selectedIndex => {
    setSelectedIdex(selectedIndex);
  };

  const onCancelDelete = () => {
    setSelectedIdex(null);
  };

  return (
    <Box m={3}>
      <DeleteAlert
        items={list}
        onCancel={onCancelDelete}
        selectedIndex={selectedIndex}
        handleDeleteAccount={handleDeleteAccount}
      />
      <HeaderBar title='帳戶列表' />
      <SearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Panel>
        <AccountsTable data={list} handleDelete={handleDelete} />
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

export default UserAccountScreen;
