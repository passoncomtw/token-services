import React from 'react';
import { withStyles, Box } from '@material-ui/core';

const styles = theme => ({
  panelBody: {
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(3),
  },
});

const PanelBody = ({ classes, children, ...props }) => {
  return (
    <Box className={classes.panelBody} {...props}>
      {children}
    </Box>
  );
};

export default withStyles(styles)(PanelBody);
