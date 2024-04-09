import React from 'react';
import { Box } from '@material-ui/core';
import Panel from '~/components/Panels/Panel';
import Divider from '~/components/Divider';
import HeaderBar from '~/components/HeaderBar';
import Pagination from '~/components/TableFields/Pagination';
import OrderSearchPanel from '~/components/SearchPanel/OrderSearchPanel';
import OrderTable from '~/components/TableFields/OrderTable';
import { useRefreshPagination } from '~/hooks';
import { getDefaultSearchRange } from '~/utils/dateUtils';

const { startDt, endDt } = getDefaultSearchRange();

const DEFAULT_PAYLOAD = {
  startDatetime: startDt,
  endDatetime: endDt,
  minAmount: '',
  maxAmount: '',
  orderType: '',
  transactionType: '',
  transactionTime: '',
  keyWordCondition: 'orderId',
  keyword: '',
};

const OrdersScreen = ({
  data,
  totalCount,
  totalPageCount,
  handleGetList,
  handleCancelOrder,
  handleCompleteOrder,
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
      <HeaderBar title='訂單管理' />
      <OrderSearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Divider />
      <Panel>
        <OrderTable
          data={data}
          handleCancelOrder={handleCancelOrder}
          handleCompleteOrder={handleCompleteOrder}
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

export default OrdersScreen;
