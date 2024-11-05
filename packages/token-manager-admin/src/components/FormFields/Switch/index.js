import React from 'react';
import propTypes from 'prop-types';
import { Switch as BasicSwitch } from '@material-ui/core';
import FormControlLabel from '@material-ui/core/FormControlLabel';

const Switch = ({ label, ...props }) => {
  return (
    <FormControlLabel
      control={<BasicSwitch color='primary' {...props} />}
      label={label}
    />
  );
};

Switch.propTypes = {
  label: propTypes.string,
  onChange: propTypes.func,
};

Switch.defaultPrsops = {
  label: '',
  onChange: () => {},
};

export default Switch;
