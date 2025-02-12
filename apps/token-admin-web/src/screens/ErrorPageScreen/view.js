import React from 'react';
import isEmpty from 'lodash/isEmpty';
import { withStyles, Box } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';
import Button from '~/components/Buttons';
import Typography from '~/components/Typography';

const styles = theme => ({
  root: {
    display: 'flex',
    width: 'calc(100vw - 200px)',
    height: 'calc(100vh - 64px)',
    backgroundPosition: 'bottom',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('xs')]: {
      width: '100vw',
    },
  },
  infoBox: {
    textAlign: 'center',
    verticalAlign: 'middle',
    display: 'table-cell',
    paddingBottom: 120,
    paddingTop: 150,
    marginBottom: 140,
  },
  icon: {
    fontSize: 50,
    marginBottom: 30,
    color: theme.colors.warning,
  },
  buttonZone: {
    margin: 10,
    marginTop: 40,
  },
  button: {
    padding: '8px 30px',
    fontSize: 16,
  },
  leftbutton: {
    padding: '8px 30px',
    fontSize: 16,
    marginRight: theme.spacing(4),
  },
  title: {
    fontSize: 18,
    marginBottom: 6,
    lineHeight: '27px',
  },
  subtitle: {
    fontSize: 12,
    lineHeight: '18px',
    color: theme.colors.greydark,
  },
});

const ERROR_CODE = {
  404: {
    title: '找不到頁面',
    subtitle: '您所瀏覽的頁面不存在或無訪問權限，請與系統管理員聯繫',
  },
  500: {
    title: '系統錯誤',
    subtitle: '您所瀏覽的頁面發生錯誤，請與系統管理員聯繫',
  },
};

const HasLoginButtons = ({ classes, onGoBack, onGoHomePage }) => {
  return (
    <Box className={classes.buttonZone}>
      <Button
        type='secondary'
        text='回上一頁'
        onClick={onGoBack}
        className={classes.leftbutton}
      />
      <Button text='回首頁' onClick={onGoHomePage} className={classes.button} />
    </Box>
  );
};

const HasNotLoginButtons = ({ classes, onGoHomePage }) => {
  return (
    <Box className={classes.buttonZone}>
      <Button
        text='回登錄頁'
        onClick={onGoHomePage}
        className={classes.button}
      />
    </Box>
  );
};

const defaultErrorCode = {
  code: '404',
  message: 'Page not found',
};

class ErrorPage extends React.Component {
  constructor(props) {
    super(props);

    const ErrorMessage = this.props.location || defaultErrorCode;

    this.state = {
      errorCode: ErrorMessage.code || '404',
      errorMessage: ErrorMessage.message || 'Page not found',
    };
  }

  onGoBack = () => {
    isEmpty(this.props.history)
      ? (window.location = '/')
      : this.props.history.goBack();
  };

  onGoHomePage = () => {
    isEmpty(this.props.history)
      ? (window.location = '/')
      : this.props.history.replace({ pathname: `/` });
  };

  render() {
    const { classes, auth, errorCode = '404' } = this.props;

    const isAuth = auth.get('isAuth');
    const { title, subtitle } = ERROR_CODE[errorCode];

    return (
      <div className={classes.root}>
        <div className={classes.infoBox}>
          <WarningIcon className={classes.icon} color={'disabled'} />
          <Typography variant='h4' className={classes.title}>
            {title}
          </Typography>
          <Typography variant='h6' className={classes.subtitle}>
            {subtitle}
          </Typography>
          {isAuth ? (
            <HasLoginButtons
              classes={classes}
              onGoBack={this.onGoBack}
              onGoHomePage={this.onGoHomePage}
            />
          ) : (
            <HasNotLoginButtons
              classes={classes}
              onGoHomePage={this.onGoHomePage}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ErrorPage);
