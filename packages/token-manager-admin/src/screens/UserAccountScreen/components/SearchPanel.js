import React from 'react';
import Grid from '~/components/Grid';
import BasicSearchPanel from '~/components/SearchPanel';
import SelectTextInput from '~/components/FormFields/SelectTextInput';
import { toSearchItems } from '~/utils/format';
import TextInput from '~/components/FormFields/TextInput';

export const ORDER_TYPE_TEXT = {
  0: '啓用',
  2: '凍結',
};

const KEYWORD_TEXT = {
  username: '姓名',
  bankName: '開户行',
  branchName: '開户支行',
  cardNumber: '銀行卡卡號',
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
        <Grid sixth>
          <TextInput
            title='帳號'
            name='account'
            placeholder='請輸入帳號'
            value={queryPayload.account}
            onChange={handleOnChange}
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
      </Grid>
    </BasicSearchPanel>
  );
};

export default SearchPanel;
