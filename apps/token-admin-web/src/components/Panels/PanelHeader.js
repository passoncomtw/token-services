import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import HeaderBar from '../HeaderBar';

const PanelHeader = ({ hide, ...props }) => {
  if (hide) return <Fragment />;

  return (
    <Box pt={3} pb={1} px={3}>
      <HeaderBar variant='h2' {...props} />
    </Box>
  );
};

PanelHeader.propTypes = {
  hide: propTypes.bool,
};

PanelHeader.defaultProps = {
  title: null,
  rightElement: null,
};

export default PanelHeader;
