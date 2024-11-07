import React from 'react';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { withStyles } from '@material-ui/core';
import classNames from 'classnames';

const styles = theme => ({
  message: {
    color: theme.colors.dangerdark,
    height: 0,
    fontSize: 10,
    marginLeft: theme.spacing(1),
    transition: 'height .5s ease',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      paddingLeft: 8,
    },
  },
  showMessage: {
    height: 20,
    lineHeight: '20px',
    textAlign: 'left',
  },
  messageWithoutLabel: {
    paddingLeft: 0,
    lineHeight: 2,
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      paddingLeft: 8,
    },
  },
});

const ValidErrorMessage = ({ classes = {}, errorMessage = '', noLabel }) => {
  const show = !isEmpty(errorMessage);

  return (
    <p
      className={classNames(classes.message, {
        [classes.showMessage]: show,
        [classes.messageWithoutLabel]: noLabel,
      })}>
      {errorMessage}
    </p>
  );
};

ValidErrorMessage.propTypes = {
  classes: propTypes.object,
  errorMessage: propTypes.string,
};

export default withStyles(styles)(ValidErrorMessage);
