import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { withStyles, Box, IconButton } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import Link from '~/components/Link';
import Typography from '~/components/Typography';
import { toDateTimeText } from '~/utils/dateUtils';

const flexRow = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'row',
};

const styles = (theme) => ({
  root: {
    ...flexRow,
    justifyContent: 'space-between',
  },
  flexRowBlock: flexRow,
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 4,
    marginRight: theme.spacing(2),
    backgroundColor: theme.colors.primary,
  },
  backText: {
    ...theme.font.h2,
    color: theme.colors.secondary,
  },
});

const ReturnBar = ({
  classes,
  title = '',
  hide = false,
  rightElement = null,
  onClick = () => false,
}) => {
  if (hide) return <Fragment />;
  return (
    <Box className={classes.root}>
      <Box className={classes.flexRowBlock}>
        <Box className={classes.backBtn} onClick={onClick}>
          <IconButton color="secondary">
            <KeyboardBackspaceIcon />
          </IconButton>
        </Box>
        <Link onClick={onClick}>
          <Typography className={classes.backText}>返回{title}</Typography>
        </Link>
      </Box>
      <Box>{rightElement}</Box>
    </Box>
  );
};

ReturnBar.propTypes = {
  hide: propTypes.bool,
  title: propTypes.string,
  onClick: propTypes.func,
};

export default withStyles(styles)(ReturnBar);
