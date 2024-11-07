import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core';

const ALIGN_MAP = {
  between: 'space-between',
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
};

const styles = theme => ({
  panelFooter: {
    display: 'flex',
    marginTop: theme.spacing(2),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },
  hasLine: {
    paddingTop: theme.spacing(2),
    borderTop: `1px solid ${theme.colors.linedark}`,
  },
});

const PanelFooter = ({ classes, children, align = 'between', hasLine = true, ...props }) => {
  const justifyContent = ALIGN_MAP[align];
  return (
    <div
      className={classNames(classes.panelFooter, {
        [classes.hasLine]: hasLine,
      })}
      {...props}
      style={{ justifyContent }}>
      {children}
    </div>
  );
};

PanelFooter.propTypes = {
  align: propTypes.oneOf(['between', 'center', 'left', 'right']),
};

export default withStyles(styles)(PanelFooter);
