import React, { Fragment } from 'react';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import VpnKeyIcon from '@material-ui/icons/VpnKey';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { Avatar, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import Typography from '~/components/Typography';
import styled from 'styled-components';
import colors from '~/theme/colors';
import EditPasswordDialog from './EditPasswordDialog';

const AvatarCircle = styled(Avatar)`
  width: 24px;
  height: 24px;
  font-size: 16px;
  background: ${colors.greyLight};
  color: ${colors.white};
`;

const Username = styled(Typography)`
  padding: 6px 6px 6px 12px;
`;

class ProfileMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditPasswordModalOpen: false,
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

  handleEditPasswordDialogOpen = () => {
    this.setState({ isEditPasswordModalOpen: true, isMenuOpen: false });
  };

  handleEditPasswordDialogClose = () => {
    this.setState({ isEditPasswordModalOpen: false });
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
        <MenuItem onClick={this.handleEditPasswordDialogOpen}>
          <VpnKeyIcon style={{ fontSize: 18, marginRight: 15 }} />
          修改登入密碼
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
            <KeyboardArrowDownIcon />
          </IconButton>
          <p>Profile</p>
        </MenuItem>
      </Menu>
    );

    const { userName = '' } = this.props;

    return (
      <Fragment>
        <EditPasswordDialog
          open={this.state.isEditPasswordModalOpen}
          onCancel={this.handleEditPasswordDialogClose}
          onConfirm={this.props.handleEditPassowrd}
        />
        <Button
          onClick={this.handleProfileMenuOpen}
          aria-owns={isMenuOpen ? 'material-appbar' : undefined}
          aria-haspopup='true'
        >
          <AvatarCircle>{userName.charAt(0).toUpperCase()}</AvatarCircle>
          <Username variant='subtitle2'>{userName}</Username>
          <KeyboardArrowDownIcon />
        </Button>
        {renderMenu}
        {renderMobileMenu}
      </Fragment>
    );
  }
}

export default ProfileMenu;
