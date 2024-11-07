import React from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';
import isEmpty from 'lodash/isEmpty';
import { withStyles } from '@material-ui/core/styles';
import { Select, MenuItem, OutlinedInput } from '@material-ui/core';
import { FormGroup, FormLabel, GroupWrapper } from '../wrappers';
import {
  inputFontSize,
  basicOptionItem,
  basicInputStyle,
  removeBorderRadius,
  basicGroupSelector,
} from '~/theme/components/inputs';

const styles = theme => ({
  groupBorderPicker: {
    ...basicInputStyle(theme),
    ...removeBorderRadius('right'),
    ...basicGroupSelector,
    flex: 'inherit',
    borderRight: 0,
    marginRight: 0,
  },
  input: {
    padding: 0,
    fontSize: inputFontSize,
    paddingLeft: theme.spacing(1),
    maxWidth: `calc( 100% - ${theme.spacing(2)}px)`,
  },
  inputRoot: {
    flex: 1,
  },
  notchedOutline: {
    ...basicInputStyle(theme),
    ...removeBorderRadius('left'),
    marginLeft: 0,
    marginRight: 0,
  },
  optionRoot: basicOptionItem,
});

const SelectTextInput = ({
  classes,
  title = '',
  items = [],
  required = false,
  selectProps = {},
  keywordsProps = {},
  onChange = () => false,
}) => {
  const handleOnChange = ({ target: { name, value } }) => {
    onChange({ name, value });
  };

  const selectClass = classnames({
    [classes.groupBorderPicker]: true,
    [selectProps.size]: true,
  });

  return (
    <FormGroup>
      <FormLabel hide={isEmpty(title)} required={required}>
        {title}
      </FormLabel>
      <GroupWrapper pr={1}>
        <Select
          onChange={handleOnChange}
          className={selectClass}
          disableUnderline={true}
          {...selectProps}>
          {items !== null &&
            items.map((data, index) => (
              <MenuItem
                key={`${selectProps.name}_${index}`}
                value={data.value}
                classes={{ root: classes.optionRoot }}>
                {data.name}
              </MenuItem>
            ))}
        </Select>
        <OutlinedInput
          variant='outlined'
          classes={{
            root: classes.inputRoot,
            input: classes.input,
            notchedOutline: classes.notchedOutline,
          }}
          onChange={handleOnChange}
          {...keywordsProps}
        />
      </GroupWrapper>
    </FormGroup>
  );
};

SelectTextInput.propTypes = {
  title: propTypes.string,
  items: propTypes.array,
  required: propTypes.bool,
  selectProps: propTypes.object,
  keywordsProps: propTypes.object,
};

export default withStyles(styles)(SelectTextInput);
