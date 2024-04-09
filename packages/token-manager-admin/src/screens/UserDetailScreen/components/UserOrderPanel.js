import React, { Fragment, useEffect } from 'react';
import { Box } from '@material-ui/core';
import Panel from '~/components/Panels/Panel';
import Divider from '~/components/Divider';
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

const UserOrderPanel = props => {
  const {
    show,
    refreshCount,
    userId,
    data,
    handleGetList,
    handleCancelOrder,
    handleCompleteOrder,
  } = props;

  const {
    onPageChange,
    onSizeChange,
    onRefresh,
    onReset,
    onSearch,
    queryPayload,
    setQueryPayload,
    page,
    size,
  } = useRefreshPagination({
    action: handleGetList,
    DEFAULT_PAYLOAD: { ...DEFAULT_PAYLOAD, userId },
    hasConditionPayload: true,
  });

  useEffect(() => {
    if (refreshCount > 0) {
      onRefresh();
    }
  }, [refreshCount]);

  if (!show) return <Fragment />;

  return (
    <Box>
      <OrderSearchPanel
        onReset={onReset}
        onSearch={onSearch}
        queryPayload={queryPayload}
        setQueryPayload={setQueryPayload}
      />
      <Divider />
      <Panel>
        <OrderTable
          isUser
          data={data}
          handleCancelOrder={handleCancelOrder}
          handleCompleteOrder={handleCompleteOrder}
        />
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

export default UserOrderPanel;
