import React from 'react';
import Grid from '~/components/Grid';
import SearchPanel from '~/components/SearchPanel';
import DateRange from '~/components/FormFields/DateRange';
import SelectInput from '~/components/FormFields/SelectInput';
import AmountRange from '~/components/FormFields/AmountRange';
import SelectTextInput from '~/components/FormFields/SelectTextInput';
import {
  USER_ORDER_TYPE_TEXT,
  TRANSACTION_TYPE_TEXT,
  TRANSACTION_TIMEING_TEXT,
} from '~/constants/status.config';
import { toSearchItems } from '~/utils/format';

const KEYWORD_TEXT = {
  orderId: '訂單編號',
  account: '帳號',
  accountName: '收款/付款人',
};

const onChange =
  setQueryPayload =>
  ({ name, value }) => {
    setQueryPayload(queryPayload => ({
      ...queryPayload,
      [name]: value,
    }));
  };

const OrderSearchPanel = props => {
  const { onReset, onSearch, queryPayload, setQueryPayload } = props;
  const handleOnChange = onChange(setQueryPayload);

  return (
    <SearchPanel onSearch={onSearch} onReset={onReset}>
      <Grid container>
        <Grid even>
          <DateRange
            title='訂單時間'
            startDateProps={{
              name: 'startDatetime',
              value: queryPayload.startDatetime,
            }}
            endDateProps={{
              name: 'endDatetime',
              value: queryPayload.endDatetime,
            }}
            onChange={handleOnChange}
          />
        </Grid>
        <Grid even>
          <SelectTextInput
            title='關鍵字'
            items={toSearchItems(KEYWORD_TEXT, [])}
            onChange={handleOnChange}
            selectProps={{
              name: 'keyWordCondition',
              value: queryPayload.keyWordCondition,
            }}
            keywordsProps={{
              name: 'keyword',
              placeholder: `請輸入${
                KEYWORD_TEXT[queryPayload.keyWordCondition]
              }`,
              value: queryPayload.keyword,
            }}
          />
        </Grid>
        <Grid even>
          <AmountRange
            title='金額'
            startInputProps={{
              name: 'minAmount',
              value: queryPayload.minAmount,
              placeholder: '最低金額',
              min: 0,
              max: 999999,
            }}
            endInputProps={{
              name: 'maxAmount',
              value: queryPayload.maxAmount,
              placeholder: '最高金額',
              min: 0,
              max: 999999,
            }}
            onChange={handleOnChange}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='訂單狀態'
            name='orderType'
            value={queryPayload.orderType}
            items={toSearchItems(USER_ORDER_TYPE_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='交易類型'
            name='transactionType'
            value={queryPayload.transactionType}
            items={toSearchItems(TRANSACTION_TYPE_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='交易時間'
            name='transactionTime'
            value={queryPayload.transactionTime}
            items={toSearchItems(TRANSACTION_TIMEING_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
      </Grid>
    </SearchPanel>
  );
};

export default OrderSearchPanel;
