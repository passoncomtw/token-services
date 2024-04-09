import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Modal, Grid, withStyles } from '@material-ui/core';

const styles = theme => ({
  progress: {
    margin: theme.spacing(2),
  },
});

const Fetching = ({ classes, open, handleClose }) => (
  <Modal open={open}>
    <Grid
      container
      justify='center'
      alignItems='center'
      style={{ height: '100%', minHeight: '100vh' }}>
      <CircularProgress
        className={classes.progress}
        color='primary'
        size={60}
      />
    </Grid>
  </Modal>
);

export default withStyles(styles)(Fetching);
