import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import HeaderBar from '../HeaderBar';

const PanelHeader = ({ hide, title = null, rightElement = null,...props }) => {
  if (hide) return <Fragment />;

  return (
    <Box pt={3} pb={1} px={3}>
      <HeaderBar variant='h2' title={title} rightElement={rightElement} {...props} />
    </Box>
  );
};

PanelHeader.propTypes = {
  hide: propTypes.bool,
};

export default PanelHeader;
