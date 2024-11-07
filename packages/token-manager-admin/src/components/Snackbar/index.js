import React from 'react';
import propTypes from 'prop-types';
import { Snackbar as BasicSnackBar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

const AlertInfo = props => {
  return <Alert elevation={6} variant='filled' {...props} />;
};

const Snackbar = props => {
  const { level = 'info', message = '', horizontal = 'center', vertical = 'bottom' } = props;

  return (
    <BasicSnackBar
      anchorOrigin={{ vertical, horizontal }}
      autoHideDuration={6000}
      key={`${message}`}
      {...props}>
      <AlertInfo severity={level}>{message}</AlertInfo>
    </BasicSnackBar>
  );
};

Snackbar.propTypes = {
  level: propTypes.string,
  message: propTypes.string,
  horizontal: propTypes.oneOf(['center', 'left', 'right']),
  vertical: propTypes.oneOf(['bottom', 'top']),
};

export default Snackbar;
