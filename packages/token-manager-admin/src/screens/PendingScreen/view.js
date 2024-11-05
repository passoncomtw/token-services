import React from 'react';
import { Box } from '@material-ui/core';
import Panel from '~/components/Panels/Panel';
import HeaderBar from '~/components/HeaderBar';
import Pagination from '~/components/TableFields/Pagination';
import PendingTable from '~/components/TableFields/PendingTable';
import SearchPanel from './components/SearchPanel';
import { useRefreshPagination } from '~/hooks';
import { getDefaultSearchRange } from '~/utils/dateUtils';

const { startDt, endDt } = getDefaultSearchRange();

const DEFAULT_PAYLOAD = {
  startDatetime: startDt,
  endDatetime: endDt,
  minAmount: '',
  maxAmount: '',
  pendingStatus: '',
  account: '',
  pendingId: '',
  orderType: '',
  minBalance: '',
  maxBalance: '',
  keyWordCondition: 'pendingId',
  keyword: '',
};
const PendingOrderScreen = ({
  data,
  totalCount,
  totalPageCount,
  handleCancelPendingOrder,
  handleDeletePendingOrder,
  handleOpenPendingOrder,
  handleStopPendingOrder,
  handleGetList,
}) => {
  const {
    onPageChange,
    onSizeChange,
    onReset,
    onSearch,
    queryPayload,
    setQueryPayload,
    page,
    size,
  } = useRefreshPagination({
    action: handleGetList,
    DEFAULT_PAYLOAD,
    hasConditionPayload: true,
  });

  return (
    <Box m={3}>
      <HeaderBar title='挂单管理' />
      <SearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Panel>
        <PendingTable
          data={data}
          handleCancelPendingOrder={handleCancelPendingOrder}
          handleDeletePendingOrder={handleDeletePendingOrder}
          handleOpenPendingOrder={handleOpenPendingOrder}
          handleStopPendingOrder={handleStopPendingOrder}
        />
        <Pagination
          size={size}
          page={page}
          totalCount={totalCount}
          totalPageCount={totalPageCount}
          onSizeChange={onSizeChange}
          onPageChange={onPageChange}
        />
      </Panel>
    </Box>
  );
};

export default PendingOrderScreen;
