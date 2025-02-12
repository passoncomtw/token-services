import React from 'react';
import { Box, withStyles } from '@material-ui/core';
import Typography from '~/components/Typography';
import welcomImg from '~/assets/images/home/img-welcome.png';

const HomeScreen = ({ classes, ...props }) => {
  return (
    <Box m={3} className={classes.container}>
      <img src={welcomImg} className={classes.img} />
      <Box pt={7} />
      <Typography variant='h1'>歡迎您到豐盈錢包後台</Typography>
      <Box pt={3} />
      <Typography variant='h3'>
        系統會根據您的權限顯示功能，如需調整，請與系統管理員聯繫
      </Typography>
    </Box>
  );
};

const styles = theme => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  img: {
    width: 276,
    height: 214,
    paddingTop: theme.spacing(20),
  },
});

export default withStyles(styles)(HomeScreen);
