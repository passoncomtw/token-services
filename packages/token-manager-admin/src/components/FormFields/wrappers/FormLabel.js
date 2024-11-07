import React from 'react';
import propTypes from 'prop-types';
import classnames from 'classnames';
import { withStyles, Box } from '@material-ui/core';
import labelSize from '~/theme/labelSize';
import Typography from '~/components/Typography';

const styles = theme => ({
  required: {
    color: 'red',
    position: 'absolute',
    marginLeft: -10,
    paddingRight: 5,
  },
  label: {
    position: 'relative',
    color: theme.colors.grey,
    lineHeight: '38px',
    textAlign: 'left',
    display: 'inline-block',
    marginRight: theme.spacing(1),
    minWidth: labelSize.md.normal,
    fontWeight: theme.fontWeight.medium,
    wordBreak: 'keep-all',
    ...theme.font.h6,
    marginBottom: 5,
    [theme.breakpoints.down('md')]: {
      textAlign: 'left',
      display: 'block',
      ...theme.font.h4,
      marginBottom: 0,
    },
    '&.sm': {
      minWidth: labelSize.sm.normal,
    },
    '&.lg': {
      minWidth: labelSize.lg.normal,
    },
  },
});

const FormLabel = ({ classes, required, hide, size = 'md', ...props }) => {
  if (hide) return null;
  const labelClass = classnames({
    [classes.label]: true,
    [size]: true,
  });
  return (
    <Box className={labelClass}>
      {required && <Typography className={classes.required}>*</Typography>}
      <Typography variant='h6'>{props.children}</Typography>
    </Box>
  );
};
FormLabel.propTypes = {
  size: propTypes.oneOf(['sm', 'md', 'lg']),
};

export default withStyles(styles)(FormLabel);
