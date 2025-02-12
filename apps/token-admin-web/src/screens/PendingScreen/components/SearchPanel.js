import React from 'react';
import Grid from '~/components/Grid';
import BasicSearchPanel from '~/components/SearchPanel';
import DateRange from '~/components/FormFields/DateRange';
import SelectInput from '~/components/FormFields/SelectInput';
import AmountRange from '~/components/FormFields/AmountRange';
import SelectTextInput from '~/components/FormFields/SelectTextInput';
import {
  PENDING_STATUS_TEXT,
  TRANSACTION_TYPE_TEXT,
} from '~/constants/status.config';
import { toSearchItems } from '~/utils/format';

const KEYWORD_TEXT = {
  pendingId: '掛單編號',
  account: '賬號',
};

const onChange =
  setQueryPayload =>
  ({ name, value }) => {
    setQueryPayload(queryPayload => ({
      ...queryPayload,
      [name]: value,
    }));
  };

const SearchPanel = props => {
  const { onReset, onSearch, queryPayload, setQueryPayload } = props;
  const handleOnChange = onChange(setQueryPayload);

  return (
    <BasicSearchPanel onSearch={onSearch} onReset={onReset}>
      <Grid container>
        <Grid third>
          <DateRange
            title='掛單時間'
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
        <Grid third>
          <AmountRange
            title='金額'
            startInputProps={{
              name: 'minAmount',
              value: queryPayload.minAmount,
              placeholder: '最低金額',
            }}
            endInputProps={{
              name: 'maxAmount',
              value: queryPayload.maxAmount,
              placeholder: '最高金額',
            }}
            onChange={handleOnChange}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='掛單狀態'
            name='pendingStatus'
            value={queryPayload.pendingStatus}
            items={toSearchItems(PENDING_STATUS_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid third>
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
        <Grid third>
          <AmountRange
            title='剩餘數量'
            startInputProps={{
              name: 'minBalance',
              value: queryPayload.minBalance,
              placeholder: '最低數量',
            }}
            endInputProps={{
              name: 'maxBalance',
              value: queryPayload.maxBalance,
              placeholder: '最高數量',
            }}
            onChange={handleOnChange}
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
      </Grid>
    </BasicSearchPanel>
  );
};

export default SearchPanel;
