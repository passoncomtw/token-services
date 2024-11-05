import React from 'react';
import Grid from '~/components/Grid';
import TextInput from '~/components/FormFields/TextInput';

const GridTextInput = ({ title, name, onChange, ...props }) => {
  return (
    <Grid quarter>
      <TextInput
        name={name}
        title={title}
        onChange={onChange}
        placeholder={`請輸入${title}`}
        {...props}
      />
    </Grid>
  );
};

export default GridTextInput;
