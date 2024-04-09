import React from 'react';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
  formGroup: {
    position: 'relative',
    width: '100%',
    minHeight: 34,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: 16,
    wordBreak: 'keep-all',
    [theme.breakpoints.down('md')]: {
      display: 'block',
      margin: '0px',
      marginTop: 4,
    },
    [theme.breakpoints.down('sm')]: {
      height: 'inherit',
      marginTop: 4,
    },
  },
});

const FormGroup = ({ classes, ...props }) => (
  <div className={classes.formGroup} {...props}>
    {props.children}
  </div>
);

export default withStyles(styles)(FormGroup);
