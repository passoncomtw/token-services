import React from 'react';
import BasicSearchPanel from '~/components/SearchPanel';
import Grid from '~/components/Grid';
import SelectInput from '~/components/FormFields/SelectInput';
import SelectTextInput from '~/components/FormFields/SelectTextInput';
import { toSearchItems } from '~/utils/format';
import { ACTIVE_STATUS_TEXT } from '~/constants/status.config';

const KEYWORD_TEXT = {
  name: '賬號',
  username: '姓名',
};

const handleOnChange =
  setQueryPayload =>
  ({ name, value }) => {
    setQueryPayload(state => ({ ...state, [name]: value }));
  };

const SearchPanel = ({ onSearch, onReset, queryPayload, setQueryPayload }) => {
  const { keyWordCondition, keyword, status } = queryPayload;

  const onChange = handleOnChange(setQueryPayload);

  return (
    <BasicSearchPanel onSearch={onSearch} onReset={onReset}>
      <Grid container>
        <Grid even>
          <SelectTextInput
            title='關鍵字'
            items={toSearchItems(KEYWORD_TEXT, [])}
            onChange={onChange}
            selectProps={{
              name: 'keyWordCondition',
              value: keyWordCondition,
            }}
            keywordsProps={{
              name: 'keyword',
              placeholder: `請輸入${KEYWORD_TEXT[keyWordCondition]}`,
              value: keyword,
            }}
          />
        </Grid>
        <Grid third>
          <SelectInput
            title='賬號狀態'
            name='status'
            items={toSearchItems(ACTIVE_STATUS_TEXT)}
            value={status}
            onChange={onChange}
          />
        </Grid>
      </Grid>
    </BasicSearchPanel>
  );
};

export default SearchPanel;
