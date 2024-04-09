import React, { Fragment } from 'react';
import classNames from 'classnames';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { Link } from 'react-router-dom';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  withStyles,
} from '@material-ui/core';
import colors from '~/theme/colors';
import ReduxStore from '~/store/configureStore';

const normalItemColor = colors.greylighter;
const activeItemColor = colors.white;
const activeItemBgColor = colors.secondary;
const styles = theme => ({
  arrowIcon: {
    color: normalItemColor,
  },
  arrowIconActive: {
    color: activeItemColor,
  },
  listItem: {
    fontWeight: 'inherit',
    color: normalItemColor,
  },
  nested: {
    paddingLeft: theme.spacing(4),
    backgroundColor: colors.menubg,
    transition: theme.transitions.create(['border'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    '& p': {
      color: normalItemColor,
      fontWeight: '100 !important',
      fontSize: '18px',
    },
  },
  nestedActive: {
    backgroundColor: activeItemBgColor,
    '& p': {
      color: activeItemColor,
    },
  },
  parentIcon: {
    color: normalItemColor,
    marginTop: '-2px',
  },
  parentIconActive: {
    color: activeItemColor,
  },
  parentText: {
    paddingLeft: 0,
    '& span': {
      color: normalItemColor,
      fontSize: '18px',
      fontFamily: [
        '"Segoe UI"',
        'Avenir',
        '"Chinese Quote"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"PingFang SC"',
        '"Hiragino Sans GB"',
        '"Microsoft YaHei"',
        '"Helvetica Neue"',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  },
  parentTextActive: {
    '& span': {
      color: activeItemColor,
    },
  },
  parentItem: {
    '& span': {
      fontWeight: '100 !important',
    },
  },
  noChildrenItemActive: {
    backgroundColor: activeItemBgColor,
  },
  nestText: {
    fontWeight: '100 !important',
    marginLeft: 40,
    '& p': {
      fontFamily: [
        '"Segoe UI"',
        'Avenir',
        '"Chinese Quote"',
        '-apple-system',
        'BlinkMacSystemFont',
        '"PingFang SC"',
        '"Hiragino Sans GB"',
        '"Microsoft YaHei"',
        '"Helvetica Neue"',
        'Helvetica',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
    },
  },
  itemIcon: {
    color: normalItemColor,
    width: theme.spacing(3),
    margin: 0,
  },
  itemIconActive: {
    color: activeItemColor,
  },
});

const MenuListItem = ({
  id,
  classes,
  parentIcon,
  openParent,
  parentText,
  path,
  handleParentClick,
}) => (
  <ListItem
    button
    key={parentText}
    to={path}
    component={Link}
    onClick={handleParentClick(id)}
    color='inherit'
    className={classNames(classes.parentItem, {
      [classes.noChildrenItemActive]: openParent,
    })}>
    <ListItemIcon
      children={parentIcon}
      className={classNames(classes.parentIcon, {
        [classes.itemIconActive]: openParent,
      })}
    />
    <ListItemText
      inset
      primary={parentText}
      className={classNames(classes.parentText, {
        [classes.parentTextActive]: openParent,
      })}
    />
  </ListItem>
);

const SideBarListItem = ({ classes, parentIcon, openParent, parentText }) => (
  <Fragment>
    <ListItemIcon
      children={parentIcon}
      className={classNames(classes.parentIcon, {
        [classes.parentIconActive]: openParent,
      })}
    />
    <ListItemText
      inset
      primary={parentText}
      className={classNames(classes.parentText, {
        [classes.parentTextActive]: openParent,
      })}
    />
  </Fragment>
);

class SidebarMenuItem extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };
  }

  handleParentClick = id => () => {
    this.setState(state => ({ open: !state.open }));
    this.props.setWatchMenu(id);
  };

  render() {
    const {
      classes,
      parentIcon,
      parentText,
      items,
      path,
      id,
      permissions,
      location,
    } = this.props;
    const { nav } = ReduxStore.getState();

    const watchedMenu = nav.get('watchedMenu');
    const openParent = watchedMenu === id;
    const hasNoChild = items.length <= 0;

    if (hasNoChild)
      return (
        <MenuListItem
          id={id}
          path={path}
          classes={classes}
          parentIcon={parentIcon}
          openParent={openParent}
          parentText={parentText}
          handleParentClick={this.handleParentClick}
        />
      );

    // TODO_WAIT_API_PERMISSION_ID_CHECK (follow RP)
    const permissionItems = items;
    // const permissionItems = items.filter(item => {
    //   const functionKey = camelCase(item.path);
    //   const hasPermission = permissions.includes(
    //     PATH_FUNCTION_IDENTIFY_MAP[functionKey]
    //   );
    //   return hasPermission;
    // });
    return (
      <Fragment>
        <ListItem
          button
          onClick={this.handleParentClick(id)}
          color='inherit'
          className={classNames(classes.parentItem, {
            [classes.parentItemActive]: openParent,
          })}>
          <SideBarListItem
            classes={classes}
            parentText={parentText}
            openParent={openParent}
            parentIcon={parentIcon}
          />
          {openParent ? (
            <ExpandLess className={classes.arrowIconActive} />
          ) : (
            <ExpandMore className={classes.arrowIcon} />
          )}
        </ListItem>
        <Collapse in={openParent} timeout='auto' unmountOnExit>
          <List component='div' disablePadding>
            {permissionItems.map(item => (
              <ListItem
                button
                key={item.text}
                to={item.path}
                component={Link}
                className={classNames(classes.nested, {
                  [classes.nestedActive]: location.pathname.includes(item.path),
                })}>
                <ListItemText
                  secondary={item.text}
                  className={classes.nestText}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </Fragment>
    );
  }
}

export default withStyles(styles)(SidebarMenuItem);
