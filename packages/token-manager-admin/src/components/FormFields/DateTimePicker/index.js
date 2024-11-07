import React from 'react';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { isDate } from 'date-fns';
import { withStyles } from '@material-ui/core';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import InvalidDateMessage from '../InvalidDateMessage';
import { FormGroup, FormLabel } from '../wrappers';
import { basicDatePickerProps } from '~/theme/components/inputs';
import { DATE_TIME_FORMAT } from '~/utils/dateUtils';

const styles = theme => ({
  ...basicDatePickerProps(theme),
  inputRoot: {
    display: 'flex',
    flex: 1,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    '& fieldset': {
      borderColor: theme.colors.linelight,
      height: 36,
    },
  },
});

const handleOnChange = (name, onChange) => date => {
  const value = isDate(date) ? date : null;
  onChange({ name, value });
};

const DateTimePicker = props => {
  const {
    classes,
    name = '',
    title = '',
    labelSize = 'md',
    value = null,
    required = false,
    textFormat = DATE_TIME_FORMAT,
    onChange: onChangeProp,
  } = props;

  const onChange = handleOnChange(name, onChangeProp);

  const datePickerClasses = {
    input: classes.input,
    root: classes.inputRoot,
    focused: classes.focused,
    disabled: classes.disabled,
    adornedEnd: classes.adornedEnd,
  };

  return (
    <FormGroup>
      <FormLabel hide={isEmpty(title)} size={labelSize} required={required}>
        {title}
      </FormLabel>
      <KeyboardDateTimePicker
        autoOk
        value={value}
        format={textFormat}
        onChange={onChange}
        okLabel='确认'
        cancelLabel='取消'
        placeholder='请选择时间'
        inputVariant='outlined'
        invalidDateMessage={<InvalidDateMessage />}
        minDate='2020-12-31'
        maxDate='2050-12-31'
        minDateMessage='所选日期不可早于2020-12-31'
        maxDateMessage='所选日期不可晚于2050-12-31'
        classes={{
          root: classes.root,
        }}
        InputProps={{
          classes: datePickerClasses,
        }}
        KeyboardButtonProps={{
          classes: {
            root: classes.buttonRoot,
          },
        }}
      />
    </FormGroup>
  );
};

DateTimePicker.propTypes = {
  name: propTypes.string,
  title: propTypes.string,
  labelSize: propTypes.oneOf(['sm', 'md', 'lg']),
  required: propTypes.bool,
  onChange: propTypes.func,
  textFormat: propTypes.string,
  value: propTypes.oneOfType([
    propTypes.oneOf([null]),
    propTypes.instanceOf(Date),
  ]),
};

export default withStyles(styles)(DateTimePicker);
