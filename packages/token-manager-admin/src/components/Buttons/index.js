import React from 'react';
import propTypes from 'prop-types';
import { Button as BaseButton, withStyles } from '@material-ui/core';
import theme from '~/theme';

const BACKGROUND_COLOR_MAP = {
  primary: theme.colors.primary,
  secondary: theme.colors.secondary,
  light: theme.colors.greyLightest,
  clear: theme.colors.transparent,
};
const FONT_COLOR_MAP = {
  primary: theme.colors.secondary,
  secondary: theme.colors.white,
  light: theme.colors.secondary,
  clear: theme.colors.greylight,
};

const styles = (theme) => ({
  root: {
    ...theme.font.h5,
    boxShadow: 'none',
    color: theme.colors.secondary,
    borderRadius: theme.shape.borderRadius,
    marginLeft: theme.spacing(1),
  },
});

const Button = (args) => {
  const {
    hide,
    startIcon = null,
    text = '',
    type = 'primary',
    style,
    onClick = () => {},
    ...props
  } = args;
  return hide ? null : (
    <BaseButton
      type="button"
      variant="contained"
      style={{
        backgroundColor: BACKGROUND_COLOR_MAP[type],
        color: FONT_COLOR_MAP[type],
        ...style,
      }}
      startIcon={startIcon}
      onClick={onClick}
      {...props}
    >
      {text}
    </BaseButton>
  );
};

Button.propTypes = {
  onClick: propTypes.func,
  type: propTypes.oneOf(['primary', 'secondary', 'light', 'clear']),
};

export default withStyles(styles)(Button);
