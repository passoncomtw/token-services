import React from 'react';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { isDate } from 'date-fns';
import { DateTimePicker } from '@material-ui/pickers';
import { Typography, withStyles } from '@material-ui/core';
import { DATE_TIME_FORMAT } from '~/utils/dateUtils';
import { FormGroup, FormLabel, GroupWrapper } from '../wrappers';
import { basicDatePickerProps } from '~/theme/components/inputs';

const InvalidDateMessage = () => {
  return <span style={{ position: 'absolute' }}></span>;
};

const styles = (theme) => ({
  ...basicDatePickerProps(theme),
  separator: {
    color: theme.colors.greydark,
    fontSize: 14,
    padding: 6,
  },
});

const handleOnDateChange = (name, onChange) => (date) => {
  const value = isDate(date) ? date : null;
  onChange({ name, value });
};

const DateRange = (props) => {
  const {
    classes,
    title = '',
    labelSize = 'md',
    required = false,
    textFormat = DATE_TIME_FORMAT,
    endDateProps = {
      name: 'endDate',
      value: null,
    },
    startDateProps = {
      name: 'startDate',
      value: null,
    },
    onChange = () => {},
  } = props;

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
      <GroupWrapper>
        <DateTimePicker
          autoOk
          strictCompareDates
          format={textFormat}
          value={startDateProps.value}
          okLabel="确认"
          cancelLabel="取消"
          placeholder="请选择时间"
          inputVariant="outlined"
          invalidDateMessage={<InvalidDateMessage />}
          maxDate={endDateProps.value}
          maxDateMessage="不可大于结束时间"
          classes={{
            root: classes.root,
          }}
          InputProps={{
            classes: datePickerClasses,
          }}
          onChange={handleOnDateChange(startDateProps.name, onChange)}
        />
        <Typography
          component="span"
          display="inline"
          className={classes.separator}
        >
          ~
        </Typography>
        <DateTimePicker
          autoOk
          strictCompareDates
          value={endDateProps.value}
          format={textFormat}
          okLabel="确认"
          cancelLabel="取消"
          placeholder="请选择时间"
          inputVariant="outlined"
          invalidDateMessage={<InvalidDateMessage />}
          minDate={startDateProps.value}
          minDateMessage="不可小于开始时间"
          maxDate="9999-12-31"
          classes={{
            root: classes.root,
          }}
          InputProps={{
            classes: datePickerClasses,
          }}
          onChange={handleOnDateChange(endDateProps.name, onChange)}
        />
      </GroupWrapper>
    </FormGroup>
  );
};

DateRange.propTypes = {
  title: propTypes.string,
  labelSize: propTypes.oneOf(['sm', 'md', 'lg']),
  required: propTypes.bool,
  onChange: propTypes.func,
  textFormat: propTypes.string,
  startDateProps: propTypes.shape({
    name: propTypes.string,
    value: propTypes.oneOfType([
      propTypes.oneOf([null]),
      propTypes.instanceOf(Date),
    ]),
  }),
  endDateProps: propTypes.shape({
    name: propTypes.string,
    value: propTypes.oneOfType([
      propTypes.oneOf([null]),
      propTypes.instanceOf(Date),
    ]),
  }),
};

export default withStyles(styles)(DateRange);
