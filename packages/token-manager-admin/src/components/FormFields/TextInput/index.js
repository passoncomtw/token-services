import React, { useEffect, useState, Fragment } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { OutlinedInput, withStyles, Box } from '@material-ui/core';
import ValidErrorMessage from './ValidErrorMessage';
import Typography from '~/components/Typography';
import { FormGroup, FormLabel } from '../wrappers';
import {
  inputFontSize,
  basicInputStyle,
  basicErrorStyle,
} from '~/theme/components/inputs';

const styles = theme => ({
  unitText: {
    fontSize: inputFontSize,
    paddingRight: 10,
    lineHeight: '35px',
    color: theme.colors.greydark,
  },
  errorInputBase: {
    ...basicErrorStyle(theme),
  },
  input: {
    fontSize: inputFontSize,
    padding: theme.spacing(1),
  },
  inputRoot: {
    flex: 1,
    width: '100%',
  },
  notchedOutline: {
    ...basicInputStyle(theme),
  },
  multiline: {
    padding: 0,
  },
});

const UnitText = ({ text, ...props }) => {
  if (isEmpty(text)) return <Fragment />;
  return <Typography {...props}>{text}</Typography>;
};

const TextInput = props => {
  const {
    name,
    classes,
    inputProps,
    placeholder,
    endAdornment,
    startAdornment,
    showErrorDetail,
    rowsMin = 3,
    maxLength = 50,
    title = '',
    unitText = '',
    type = 'text',
    labelSize = 'md',
    errorMessage = '',
    value = null,
    hide = false,
    required = false,
    disabled = false,
    onBlur = () => false,
    onChange = () => false,
    multiline = false,
  } = props;

  const [text, setText] = useState('');

  useEffect(() => {
    value === null ? setText('') : setText(value);
  }, [value]);

  if (hide) return null;

  const handleOnChange = ({ target: { name, value } }) => {
    setText(value);
    onChange({ name, value });
  };
  const isError = !isEmpty(errorMessage);

  const multilineProps = multiline ? { rowsMin } : {};

  return (
    <div>
      <FormGroup>
        <FormLabel hide={isEmpty(title)} size={labelSize} required={required}>
          {title}
        </FormLabel>
        <Box width='100%' boxSizing='border-box'>
          <OutlinedInput
            type={type}
            name={name}
            value={text}
            onBlur={onBlur}
            disabled={disabled}
            multiline={multiline}
            placeholder={placeholder}
            inputProps={{ maxLength, ...multilineProps, ...inputProps }}
            onChange={handleOnChange}
            classes={{
              root: classes.inputRoot,
              input: classes.input,
              notchedOutline: classNames(classes.notchedOutline, {
                [classes.errorInputBase]: isError,
              }),
              multiline: classes.multiline,
            }}
            startAdornment={startAdornment}
            endAdornment={endAdornment}
          />
          <UnitText text={unitText} className={classes.unitText} />
        </Box>
      </FormGroup>
      <ValidErrorMessage
        noLabel={isEmpty(title)}
        errorMessage={showErrorDetail ? errorMessage : ''}
      />
    </div>
  );
};

TextInput.propTypes = {
  value: propTypes.oneOfType([propTypes.number, propTypes.string]),
  labelSize: propTypes.oneOf(['sm', 'md', 'lg']),
  hide: propTypes.bool,
  disabled: propTypes.bool,
  multiline: propTypes.bool,
  type: propTypes.string,
  title: propTypes.string,
  unitText: propTypes.string,
  showErrorDetail: propTypes.bool,
  errorMessage: propTypes.string,
  defaultValue: propTypes.string,
  onBlur: propTypes.func,
  startAdornment: propTypes.node,
  endAdornment: propTypes.node,
  onChange: propTypes.func.isRequired,
};

export default withStyles(styles)(TextInput);
