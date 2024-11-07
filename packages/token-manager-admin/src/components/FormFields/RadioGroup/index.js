import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { withStyles } from '@material-ui/core';
import Radio from '../Radio';
import { FormGroup, FormLabel } from '../wrappers';

const styles = theme => ({
  formControl: {
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(2),
    },
    [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(2),
    },
  },
});

const handleOnChange = onChange => ({ target: { name, value } }) => {
  onChange({ name, value: parseInt(value) });
};

const RadioGroup = props => {
  const {
    name,
    title,
    required,
    classes,
    value,
    disabled,
    hide = false,
    items = [],
    onChange: propsOnChange = () => false,
  } = props;

  if (hide) return <Fragment />;

  const onChange = handleOnChange(propsOnChange);

  return (
    <FormGroup>
      <FormLabel hide={isEmpty(title)} required={required}>
        {title}
      </FormLabel>
      <div className={classes.formControl}>
        {items.map(item => {
          const checked = item.value === value;
          return (
            <Radio
              key={`radio_${item.name}`}
              name={name}
              label={item.name}
              value={item.value}
              checked={checked}
              disabled={disabled}
              onChange={onChange}
            />
          );
        })}
      </div>
    </FormGroup>
  );
};

RadioGroup.propTypes = {
  hide: propTypes.bool,
  name: propTypes.string.isRequired,
  items: propTypes.arrayOf(
    propTypes.shape({
      name: propTypes.string,
      value: propTypes.oneOfType([propTypes.string, propTypes.number]),
    })
  ).isRequired,
  onChange: propTypes.func,
};

export default withStyles(styles)(RadioGroup);
