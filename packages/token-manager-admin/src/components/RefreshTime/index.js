import React, { Fragment } from 'react';
import propTypes from 'prop-types';
import { withStyles, Box, IconButton } from '@material-ui/core';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Typography from '~/components/Typography';

const styles = theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  timeText: {
    ...theme.font.h5,
    color: theme.colors.greydark,
  },
});

const ReturnBar = ({ hide, dateTime, onRefrshClick, classes }) => {
  if (hide) return <Fragment />;
  return (
    <Box className={classes.root}>
      <IconButton color='secondary' onClick={onRefrshClick}>
        <AutorenewIcon />
      </IconButton>
      <Typography className={classes.timeText}>更新时间：{dateTime}</Typography>
    </Box>
  );
};

ReturnBar.propTypes = {
  hide: propTypes.bool,
  dateTime: propTypes.string,
  onRefrshClick: propTypes.func,
};

ReturnBar.defaultProps = {
  hide: false,
  dateTime: '',
  onRefrshClick: () => false,
};

export default withStyles(styles)(ReturnBar);
