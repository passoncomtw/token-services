import React from 'react';
import { Box, withStyles } from '@material-ui/core';

const styles = theme => ({
  root: {
    width: '100%',
    display: 'flex',
    boxSizing: 'border-box',
  },
});

const GroupWrapper = ({ classes, children, ...props }) => {
  return (
    <Box className={classes.root} {...props}>
      {children}
    </Box>
  );
};

export default withStyles(styles)(GroupWrapper);
