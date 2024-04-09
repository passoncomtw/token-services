import React from 'react';
import Grid from '~/components/Grid';
import BasicSearchPanel from '~/components/SearchPanel';
import SelectInput from '~/components/FormFields/SelectInput';
import SelectTextInput from '~/components/FormFields/SelectTextInput';
import { toSearchItems } from '~/utils/format';
import { ACTIVE_STATUS_TEXT, USER_TYPE_TEXT } from '~/constants/status.config';

export const ORDER_TYPE_TEXT = {
  0: '啓用',
  2: '凍結',
};

const KEYWORD_TEXT = {
  account: '帳號',
  username: '暱稱',
  mail: '郵箱',
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
        <Grid sixth>
          <SelectInput
            title='會員狀態'
            name='status'
            value={queryPayload.status}
            items={toSearchItems(ACTIVE_STATUS_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='會員類型'
            name='type'
            value={queryPayload.type}
            items={toSearchItems(USER_TYPE_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='交易類型'
            name='transactionType'
            value={queryPayload.transactionType}
            items={toSearchItems(ORDER_TYPE_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
        <Grid sixth>
          <SelectInput
            title='掛單類型'
            name='orderType'
            value={queryPayload.orderType}
            items={toSearchItems(ORDER_TYPE_TEXT)}
            onChange={handleOnChange}
            labelProps={{ size: 'sm' }}
          />
        </Grid>
      </Grid>
    </BasicSearchPanel>
  );
};

export default SearchPanel;
