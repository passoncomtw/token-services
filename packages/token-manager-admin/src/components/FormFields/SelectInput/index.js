import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { Select, MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, FormLabel, GroupWrapper } from '../wrappers';
import ValidErrorMessage from '../TextInput/ValidErrorMessage';
import {
  basicInputStyle,
  basicErrorStyle,
  basicOptionItem,
} from '~/theme/components/inputs';

const styles = theme => ({
  borderPicker: {
    ...basicInputStyle(theme),
    display: 'inline-block',
    width: '100%',
    [theme.breakpoints.down('md')]: {
      display: 'block',
    },
    '& .MuiSelect-select:focus': {
      backgroundColor: 'inherit',
    },
  },
  errorInputBase: {
    ...basicErrorStyle(theme),
  },
  optionRoot: basicOptionItem,
});

const SelectInput = ({
  classes,
  required,
  hide,
  title = '',
  items = [],
  labelProps = {},
  onChange,
  defaultItem,
  errorMessage,
  ...props
}) => {
  if (hide) return null;

  const handleOnChange = ({ target: { name, value } }) => {
    onChange({ name, value });
  };

  const selectClass = classNames({
    [classes.borderPicker]: true,
    [classes.errorInputBase]: !isEmpty(errorMessage),
  });

  const mergedItems = isEmpty(defaultItem) ? items : [defaultItem, ...items];

  return (
    <Fragment>
      <FormGroup>
        <FormLabel {...labelProps} hide={isEmpty(title)} required={required}>
          {title}
        </FormLabel>
        <GroupWrapper>
          <Select
            displayEmpty
            onChange={handleOnChange}
            className={selectClass}
            disableUnderline={true}
            {...props}>
            {mergedItems !== null &&
              mergedItems.map((data, index) => (
                <MenuItem
                  key={`${props.name}_${index}`}
                  value={data.value}
                  classes={{ root: classes.optionRoot }}
                  disabled={
                    data.disabled !== undefined ? data.disabled : false
                  }>
                  {data.name}
                </MenuItem>
              ))}
          </Select>
        </GroupWrapper>
      </FormGroup>
      <ValidErrorMessage errorMessage={errorMessage} />
    </Fragment>
  );
};

SelectInput.propTypes = {
  value: propTypes.oneOfType([propTypes.number, propTypes.string]),
  items: propTypes.arrayOf(
    propTypes.shape({
      name: propTypes.string,
      value: propTypes.oneOfType([propTypes.number, propTypes.string]),
    })
  ),
  defaultItem: propTypes.shape({
    name: propTypes.string,
    value: propTypes.oneOfType([propTypes.number, propTypes.string]),
  }),
  hide: propTypes.bool,
  disabled: propTypes.bool,
  title: propTypes.string,
  unitText: propTypes.string,
  errorMessage: propTypes.string,
  onChange: propTypes.func.isRequired,
};

SelectInput.defaultProps = {
  value: '',
  hide: false,
  disabled: false,
  title: '',
  items: [],
  defaultItem: {},
  errorMessage: '',
  onChange: () => null,
};
export default withStyles(styles)(SelectInput);
