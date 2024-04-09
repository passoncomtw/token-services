import React, { Fragment, useState, useEffect } from 'react';
import Panel from '~/components/Panels/Panel';
import Pagination from '~/components/TableFields/Pagination';
import PendingTable from '~/components/TableFields/PendingTable';
import { useRefreshPagination } from '~/hooks';

const PendingPanel = ({
  show,
  refreshCount,
  userId,
  data,
  handleGetList,
  handleCancelPendingOrder,
  handleDeletePendingOrder,
  handleOpenPendingOrder,
  handleStopPendingOrder,
}) => {
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
    DEFAULT_PAYLOAD: { userId },
    hasConditionPayload: false,
  });

  useEffect(() => {
    if (refreshCount > 0) {
      onRefresh();
    }
  }, [refreshCount]);

  if (!show) return <Fragment />;

  return (
    <Panel>
      <PendingTable
        isUser
        data={data}
        handleCancelPendingOrder={handleCancelPendingOrder}
        handleDeletePendingOrder={handleDeletePendingOrder}
        handleOpenPendingOrder={handleOpenPendingOrder}
        handleStopPendingOrder={handleStopPendingOrder}
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
  );
};

export default PendingPanel;
