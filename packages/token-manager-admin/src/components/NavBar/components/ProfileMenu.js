import React, { Fragment } from 'react';
import AccountCircle from '@material-ui/icons/AccountCircle';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { IconButton, Menu, MenuItem } from '@material-ui/core';

class ProfileMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isMobileMenuOpen: false,
      isMenuOpen: false,
      anchorEl: null,
      mobileMoreAnchorEl: null,
    };
  }

  handleProfileMenuOpen = event => {
    this.setState({ anchorEl: event.currentTarget, isMenuOpen: true });
  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
    this.handleMobileMenuClose();
  };

  handleMobileMenuOpen = event => {
    this.setState({ mobileMoreAnchorEl: event.currentTarget });
  };

  handleMobileMenuClose = () => {
    this.setState({ mobileMoreAnchorEl: null, isMenuOpen: false });
  };

  render() {
    const { anchorEl, mobileMoreAnchorEl, isMenuOpen, isMobileMenuOpen } =
      this.state;

    const renderMenu = (
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMenuOpen}
        onClose={this.handleMenuClose}
      >
        <MenuItem onClick={this.props.updatePassword}>
          <VpnKeyIcon style={{ fontSize: 18, marginRight: 15 }} />
          修改密碼
        </MenuItem>
        <MenuItem onClick={this.props.logout}>
          <KeyboardBackspaceIcon style={{ fontSize: 18, marginRight: 15 }} />
          登出
        </MenuItem>
      </Menu>
    );

    const renderMobileMenu = (
      <Menu
        anchorEl={mobileMoreAnchorEl}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={isMobileMenuOpen}
        onClose={this.handleMobileMenuClose}
      >
        <MenuItem onClick={this.handleProfileMenuOpen}>
          <IconButton color='inherit'>
            <AccountCircle />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );

    return (
      <Fragment>
        <IconButton
          aria-owns={isMenuOpen ? 'material-appbar' : undefined}
          aria-haspopup='true'
          onClick={this.handleProfileMenuOpen}
          color='inherit'
        >
          <AccountCircle />
        </IconButton>
        {renderMenu}
        {renderMobileMenu}
      </Fragment>
    );
  }
}

export default ProfileMenu;
