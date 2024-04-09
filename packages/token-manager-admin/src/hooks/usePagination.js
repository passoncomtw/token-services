import { useState, useEffect } from 'react';
import cloneDeep from 'lodash/cloneDeep';
import isUndefined from 'lodash/isUndefined';

const handleQueryPayload = hasConditionPayload => queryPayload => {
  if (!hasConditionPayload) {
    return queryPayload;
  }

  const { keyWordCondition, keyword, ...newQueryPayload } = queryPayload;
  return {
    ...newQueryPayload,
    [keyWordCondition]: keyword,
  };
};

const usePagination = ({
  action,
  DEFAULT_PAYLOAD = {},
  hasConditionPayload = false,
  hasSearchBar = true,
  effectAction,
}) => {
  const [queryPayload, setQueryPayload] = useState(cloneDeep(DEFAULT_PAYLOAD));
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  const getQueryPayload = handleQueryPayload(hasConditionPayload);

  const onPageChange = currentPage => {
    const payload = {
      ...queryPayload,
      page: currentPage,
      size,
    };
    setPage(currentPage);
    action(getQueryPayload(payload));
  };

  const onSizeChange = currentSize => {
    const payload = {
      ...queryPayload,
      page: 1,
      size: currentSize,
    };
    setPage(1);
    setSize(currentSize);
    action(getQueryPayload(payload));
  };

  const onReset = () => {
    setQueryPayload(DEFAULT_PAYLOAD);
    setPage(1);
    action({ ...DEFAULT_PAYLOAD, page: 1, size });
  };

  const onSearch = () => {
    setPage(1);
    action(getQueryPayload({ ...queryPayload, page: 1, size }));
  };

  useEffect(() => {
    const newQueryPayload = getQueryPayload(queryPayload);

    action(newQueryPayload);
    if (!isUndefined(effectAction)) effectAction(newQueryPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!hasSearchBar) {
    return {
      onPageChange,
      onSizeChange,
      page,
      size,
    };
  }

  return {
    onPageChange,
    onSizeChange,
    onReset,
    onSearch,
    queryPayload,
    setQueryPayload,
    page,
    size,
  };
};

export default usePagination;
