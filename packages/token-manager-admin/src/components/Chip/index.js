import React from 'react';
import propTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Box, Chip as BasicChip } from '@material-ui/core';
import colors from '~/theme/colors';

const styles = (theme) => ({
  root: {
    display: 'inline-flex',
    flexWrap: 'wrap',
    paddingTop: theme.spacing(1),
  },
  chip: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
    boxShadow: '4px 5px 5px -3px rgba(0,0,0,0.3)',
  },
});

const Chip = ({
  classes,
  label = '',
  href = '#',
  bgColor = 'greylight',
  ...props
}) => {
  return (
    <Box className={classes.root}>
      <BasicChip
        clickable
        component="a"
        href={href}
        label={label}
        className={classes.chip}
        style={{
          color: colors.white,
          backgroundColor: colors[bgColor],
        }}
        {...props}
      />
    </Box>
  );
};

Chip.defaultPropTypes = {
  label: propTypes.string,
  href: propTypes.string,
  bgColor: propTypes.string,
};

export default withStyles(styles)(Chip);
