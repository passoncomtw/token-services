import React from 'react';
import propTypes from 'prop-types';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '~/components/Typography';

const Adornment = ({ text, position }) => (
  <InputAdornment position={position}>
    <Typography variant='h4'>{text}</Typography>
  </InputAdornment>
);

Adornment.propTypes = {
  text: propTypes.string.isRequired,
  position: propTypes.string.isRequired,
};
export default Adornment;
