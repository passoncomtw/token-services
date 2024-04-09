import React from 'react';
import Grid from '~/components/Grid';
import BasicSearchPanel from '~/components/SearchPanel';
import TextInput from '~/components/FormFields/TextInput';

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
          <TextInput
            title='銀行代碼'
            name='bankCode'
            placeholder='請輸入銀行代碼'
            value={queryPayload.bankCode}
            onChange={handleOnChange}
          />
        </Grid>
        <Grid third>
          <TextInput
            title='銀行'
            name='bankName'
            placeholder='請輸入銀行'
            value={queryPayload.bankName}
            onChange={handleOnChange}
          />
        </Grid>
      </Grid>
    </BasicSearchPanel>
  );
};

export default SearchPanel;
