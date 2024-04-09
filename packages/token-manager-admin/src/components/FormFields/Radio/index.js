import React from 'react';
import propTypes from 'prop-types';
import { withStyles } from '@material-ui/styles';
import { Radio as BasicRadio } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const styles = theme => ({
  root: {
    color: theme.colors.grey,
    '&checked': {
      color: theme.colors.secondary,
    },
  },
});

const Radio = ({ label, classes, ...props }) => {
  return (
    <FormControlLabel
      control={
        <BasicRadio color='secondary' className={classes.root} {...props} />
      }
      label={label}
    />
  );
};

Radio.propTypes = {
  label: propTypes.string,
  checked: propTypes.bool,
  onChange: propTypes.func,
};

Radio.defaultPrsops = {
  label: '',
  checked: true,
  onChange: () => {},
};

export default withStyles(styles)(Radio);
