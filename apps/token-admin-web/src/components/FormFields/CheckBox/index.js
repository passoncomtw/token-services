import React from 'react';
import propTypes from 'prop-types';
import { Checkbox as BasicCheckbox, withStyles } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const styles = theme => ({
  root: {
    color: theme.colors.grey,
  },
});

const CheckBox = ({ label, classes, ...props }) => {
  return (
    <FormControlLabel
      control={
        <BasicCheckbox
          color='secondary'
          classes={{ root: classes.root }}
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

CheckBox.defaultProps = {
  label: '',
  checked: false,
  onChange: () => {},
};

export default withStyles(styles)(CheckBox);
