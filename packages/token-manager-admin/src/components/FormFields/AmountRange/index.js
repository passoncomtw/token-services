import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { OutlinedInput, Typography } from '@material-ui/core';
import { FormGroup, FormLabel, GroupWrapper } from '../wrappers';
import { inputFontSize, basicInputStyle } from '~/theme/components/inputs';

const styles = theme => ({
  separator: {
    fontSize: 14,
    lineHeight: '30px',
    color: theme.colors.greydark,
  },
  input: {
    padding: 0,
    fontSize: inputFontSize,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(2),
  },
  inputRoot: {
    flex: 1,
    '&:not(:first-child)': {
      marginLeft: theme.spacing(1),
    },
  },
  notchedOutline: {
    ...basicInputStyle(theme),
  },
});

const handleOnChange = onChange => ({ target: { name, value } }) => {
  onChange({ name, value });
};

const AmountRange = ({
  title,
  classes,
  onChange: propsOnChange,
  endInputProps,
  startInputProps,
}) => {
  const onChange = handleOnChange(propsOnChange);

  const inputClasses = {
    root: classes.inputRoot,
    input: classes.input,
    notchedOutline: classes.notchedOutline,
  };

  return (
    <FormGroup>
      <FormLabel>{title}</FormLabel>
      <GroupWrapper>
        <OutlinedInput
          type='number'
          classes={inputClasses}
          onChange={onChange}
          inputProps={startInputProps}
        />
        <Typography className={classes.separator}>~</Typography>
        <OutlinedInput
          type='number'
          classes={inputClasses}
          onChange={onChange}
          inputProps={endInputProps}
        />
      </GroupWrapper>
    </FormGroup>
  );
};

export default withStyles(styles)(AmountRange);
