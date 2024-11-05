import React from 'react';
import { withStyles, Box, Table as BasicTable } from '@material-ui/core';

const styles = theme => ({
  box: {
    overflowX: 'auto',
  },
  table: {
    position: 'relative',
  },
});

const Table = ({ id, children, className, classes }) => (
  <Box
    id={id}
    classes={{
      root: classes.box,
    }}>
    <BasicTable
      classes={{
        root: classes.table,
      }}
      className={className}>
      {children}
    </BasicTable>
  </Box>
);

export default withStyles(styles)(Table);
