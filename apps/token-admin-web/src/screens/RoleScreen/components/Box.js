import React from 'react';
import classNames from 'classnames';
import { Box as BasicBox } from '@material-ui/core';
import { withStyles } from '@material-ui/core';

const styles = theme => ({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'flex-start',
    height: '50vh',
    width: '100%',
    padding: theme.spacing(2),
    marginLeft: 0,
    marginRight: theme.spacing(1),
    overflow: 'scroll',
    border: `1px solid ${theme.colors.linelight}`,
    borderRadius: theme.shape.borderRadius,
    [theme.breakpoints.down('lg')]: {
      width: '100%',
      marginRight: theme.spacing(2),
    },
    [theme.breakpoints.down('md')]: {
      width: 'initial',
      marginLeft: theme.spacing(1),
      marginRight: 0,
    },
  },
  error: {
    border: `1px solid ${theme.colors.dangerlight} !important`,
  },
});

const Box = ({ classes, isError, ...props }) => {
  const rootClass = classNames({
    [classes.root]: true,
    [classes.error]: isError,
  });
  return <BasicBox classes={{ root: rootClass }}>{props.children}</BasicBox>;
};

export default withStyles(styles)(Box);
