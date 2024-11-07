import React from 'react';
import propTypes from 'prop-types';
import { Link as BaseLink, withStyles } from '@material-ui/core';

const styles = theme => ({
  root: {
    ...theme.font.h4,
  },
});
const Link = ({ hide = false, children, color, ...props }) => {
  return hide ? null : (
    <BaseLink
      type='Link'
      style={{
        color,
      }}
      {...props}>
      {children}
    </BaseLink>
  );
};

Link.propTypes = {
  hide: propTypes.bool,
};

export default withStyles(styles)(Link);
