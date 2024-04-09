import React from 'react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import {
  withStyles,
  createTheme,
  MuiThemeProvider,
} from '@material-ui/core/styles';
import {
  Toolbar,
  AppBar,
  IconButton,
  Drawer,
  Divider,
  Hidden,
} from '@material-ui/core';
import colors from '~/theme/colors';
import SnackBar from '~/components/Snackbar';
import ErrorBoundary from '~/components/ErrorBoundary';
import ProfileMenu from './components/ProfileMenu';
import SidebarMenu from './components/SidebarMenu';
import AlertDialog from './components/AlertDialog';
import Logo from '~/assets/images/sidebar-logo.png';

const drawerWidth = 200;
const drawerNotifyWidth = 600;

const darkTheme = createTheme({
  typography: {
    useNextVariants: true,
  },
  palette: {
    type: 'dark', // Switching the dark mode on is a single property value change.
  },
});

const styles = theme => ({
  root: {
    width: '100%',
    backgroundColor: colors.bodybg,
    minHeight: '100vh',
    height: '100%',
    fontFamily: theme.typography.fontFamily,
  },
  grow: {
    flexGrow: 1,
  },
  appBar: {
    backgroundColor: theme.colors.white,
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: `0px 0px 3px rgba(82, 63, 105, 0.08)`,
    padding: '0px 15px',
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxShadow: `0px 0px 3px rgba(0, 0, 0, 0.72)`,
    borderBottom: `1px solid ${colors.primarydark}`,
  },
  menuButton: {
    marginRight: 36,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  hide: {
    display: 'none',
  },
  drawer: {
    width: 0,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    backgroundColor: colors.menubg,
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
    },
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    borderRight: `0px solid ${theme.colors.black}`,
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: 0,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  sectionDesktop: {
    display: 'flex',
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    paddingLeft: 0,
    backgroundColor: colors.bodybg,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
    },
  },
  contentShift: {
    marginLeft: 0,
    transition: theme.transitions.create(['margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
    },
  },
  contentShiftRight: {
    [theme.breakpoints.up('sm')]: {
      marginRight: drawerNotifyWidth,
    },
  },
  divider: {
    borderBottom: `1px solid ${colors.menubg}`,
    height: 0,
  },
  sideBar: {
    borderRight: '1px solid #000',
  },
  infoLogo: {
    width: '172px',
    paddingRight: '8px',
  },
});

class LayoutWrapper extends React.PureComponent {
  componentDidMount = () => {
    this.checkWatchMenuOpened();
    this.props.hideAlertDialog();
  };

  showAlertDialog = type => () => {
    this.props.showAlertDialog({
      alertMessage: '是否确定登出？',
      alertType: type,
      level: 'info',
    });
  };

  handleDrawerOpen = () => {
    this.props.sideBarSwitch(true);
    this.checkWatchMenuOpened();
  };

  checkWatchMenuOpened = () => {
    const { location, setWatchMenu } = this.props;
    const pathId = location.pathname.split('/')[1];
    if (pathId !== undefined) setWatchMenu(pathId);
  };

  handleDrawerClose = () => {
    this.props.sideBarSwitch(false);
    this.props.setWatchMenu('');
  };

  handleLogout = () => {
    this.props.handleLogout();
  };

  handleForceLogout = () => {
    this.props.handleForceLogout();
  };

  handleSnackBarClose = () => {
    this.props.closeSnackBar();
  };

  handleAlertConfirm = () => {
    const { alertType } = this.props;

    switch (alertType) {
      case 'LOGOUT':
      case 'PERMISSION_EXPIRED':
        this.handleLogout();
        break;
      case 'FORCE_LOGOUT':
        this.handleForceLogout();
        break;
      default:
        break;
    }

    this.props.hideAlertDialog();
  };

  handleAlertCancel = () => {
    const { mode } = this.props;

    mode === 'confirm'
      ? this.handleAlertConfirm()
      : this.props.hideAlertDialog();
  };

  resetWatchMenu = () => {
    this.props.setWatchMenu('');
  };

  render() {
    const {
      classes,
      theme,
      isAuth,
      watchedMenu,
      isSideBarOpened,
      isAlertDialogOpen,
      alertMessage,
      userName,
      open,
      message,
      level,
      mode,
      navLevel,
      ...others
    } = this.props;

    if (!isAuth) {
      return (
        <ErrorBoundary>
          <SnackBar
            open={open}
            message={message}
            level={level}
            onClose={this.handleSnackBarClose}
          />
          <div className={classes.root}>{this.props.children}</div>
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary>
        <div className={classes.root}>
          <AlertDialog
            title={alertMessage}
            open={isAlertDialogOpen}
            mode={mode}
            level={navLevel}
            onConfirm={this.handleAlertConfirm}
            onCancel={this.handleAlertCancel}
          />
          <SnackBar
            open={open}
            message={message}
            level={level}
            onClose={this.handleSnackBarClose}
          />
          <AppBar
            position='fixed'
            className={classNames(classes.appBar, {
              [classes.appBarShift]: isSideBarOpened,
            })}
          >
            <Toolbar disableGutters={!isSideBarOpened}>
              <IconButton
                color='inherit'
                aria-label='Open drawer'
                onClick={this.handleDrawerOpen}
                className={classNames(classes.menuButton, {
                  [classes.hide]: isSideBarOpened,
                })}
              >
                <MenuIcon />
              </IconButton>
              <div className={classes.grow} />
              <div className={classes.sectionDesktop}>
                <ProfileMenu
                  userName={userName}
                  handleEditPassowrd={this.props.handleEditPassowrd}
                  logout={this.showAlertDialog('LOGOUT')}
                />
              </div>
            </Toolbar>
          </AppBar>
          <MuiThemeProvider theme={darkTheme}>
            <Hidden smUp>
              <Drawer
                variant='temporary'
                open={isSideBarOpened}
                onClose={this.handleDrawerClose}
                className={classNames(classes.drawer, {
                  [classes.drawerOpen]: isSideBarOpened,
                })}
                classes={{
                  paper: classNames(classes.drawer, {
                    [classes.drawerOpen]: isSideBarOpened,
                  }),
                }}
              >
                <Link to='/'>
                  <div className={classes.toolbar}>
                    <img className={classes.infoLogo} src={Logo} alt='LOGO' />
                    <IconButton onClick={this.handleDrawerClose}>
                      {theme.direction === 'rtl' ? (
                        <ChevronRightIcon />
                      ) : (
                        <ChevronLeftIcon />
                      )}
                    </IconButton>
                  </div>
                </Link>
                <Divider className={classes.divider} />
                <SidebarMenu watchedMenu={watchedMenu} {...others} />
              </Drawer>
            </Hidden>
            <Hidden xsDown>
              <Drawer
                open
                anchor='left'
                variant='persistent'
                className={classNames(classes.drawer, {
                  [classes.drawerOpen]: true,
                })}
                classes={{
                  paper: classNames(classes.drawer, {
                    [classes.drawerOpen]: true,
                  }),
                }}
              >
                <Link to='/'>
                  <div className={classes.toolbar}>
                    <img
                      className={classes.infoLogo}
                      src={Logo}
                      alt='LOGO'
                      onClick={this.resetWatchMenu}
                    />
                  </div>
                </Link>
                <Divider className={classes.divider} />
                <SidebarMenu watchedMenu={watchedMenu} {...others} />
              </Drawer>
            </Hidden>
          </MuiThemeProvider>
          <main
            className={classNames(classes.content, {
              [classes.contentShift]: isSideBarOpened,
            })}
          >
            <div className={classes.toolbar} />
            {this.props.children}
          </main>
        </div>
      </ErrorBoundary>
    );
  }
}

export default withStyles(styles, { withTheme: true })(LayoutWrapper);
