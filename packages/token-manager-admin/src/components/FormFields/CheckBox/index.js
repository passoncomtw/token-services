import React from 'react';
import propTypes from 'prop-types';
import { Checkbox as BasicCheckbox, withStyles } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const styles = (theme) => ({
  root: {
    color: theme.colors.grey,
  },
});

const CheckBox = ({ classes, label = '', checked = false, ...props }) => {
  return (
    <FormControlLabel
      control={
        <BasicCheckbox
          color="secondary"
          classes={{ root: classes.root }}
          checked={checked}
          {...props}
        />
      }
      label={label}
    />
  );
};

CheckBox.propTypes = {
  label: propTypes.string,
  checked: propTypes.bool,
  onChange: propTypes.func,
};

export default withStyles(styles)(CheckBox);
