import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import Panel from '~/components/Panels/Panel';
import HeaderBar from '~/components/HeaderBar';
import Pagination from '~/components/TableFields/Pagination';
import Table from './components/Table';
import SearchPanel from './components/SearchPanel';
import { usePagination } from '~/hooks';

const DEFAULT_PAYLOAD = {
  type: '',
  status: '',
  orderType: '',
  transactionType: '',
  keyWordCondition: 'account',
  keyword: '',
};

const UserListScreen = props => {
  const { users, userCount, history, handleGetList } = props;
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

  const goToDetail = userId => () =>
    history.push({ pathname: `/users/list/${userId}` });

  return (
    <Box m={3}>
      <HeaderBar title='會員列表' />
      <SearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Panel>
        <Table data={users} goToDetail={goToDetail} />
        <Pagination
          size={size}
          page={page}
          totalCount={userCount}
          totalPageCount={parseInt(userCount / size) + 1}
          onSizeChange={onSizeChange}
          onPageChange={onPageChange}
        />
      </Panel>
    </Box>
  );
};

export default UserListScreen;
