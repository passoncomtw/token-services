import React from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';
import isFunction from 'lodash/isFunction';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import { withStyles, withMobileDialog } from '@material-ui/core';
import Button from '~/components/Buttons';
import Typography from '~/components/Typography';
import { Panel, PanelFooter } from '~/components/Panels';
import TextButton from '~/components/Buttons/TextButton';

const style = theme => ({
  paper: {
    minWidth: '300px',
    width: '100%',
    overflow: 'visible',
  },
  dialogContent: {
    paddingTop: theme.spacing(2),
    overflow: 'auto',
    maxHeight: 'calc(100vh - 220px)',
  },
  flexDialog: {
    display: 'flex',
  },
});

const DialogTitle = ({ children }) => (
  <Box
    px={3}
    display='flex'
    flexDirection='row'
    justifyContent='space-between'
    alignItems='center'
    minHeight={56}
    borderBottom='1px solid #EBEDF3'
  >
    {children}
  </Box>
);

const DialogWrapper = props => {
  const {
    open,
    mode,
    title,
    isFlex,
    classes,
    onClose,
    hasLine,
    onCancel,
    maxWidth,
    children,
    onConfirm,
    rightTitleElement,
    confirmText,
    cancelText,
    isConfirmDisabled,
  } = props;

  return (
    <Dialog
      aria-labelledby='detail-dialog'
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      PaperProps={{ className: classes.paper }}
    >
      <Panel>
        <DialogTitle>
          <Typography variant='h2'>{title}</Typography>
          {rightTitleElement}
        </DialogTitle>
        <DialogContent
          className={classNames(classes.dialogContent, {
            [classes.flexDialog]: isFlex,
          })}
        >
          {children}
        </DialogContent>
        <PanelFooter
          hasLine={hasLine}
          align={mode === 'confirm' ? 'center' : 'between'}
          style={{ marginTop: 0 }}
        >
          <Button
            className={classes.button}
            text={confirmText}
            onClick={onConfirm}
            disabled={isConfirmDisabled}
          />
          <TextButton
            hide={mode === 'confirm'}
            text={cancelText}
            onClick={isFunction(onCancel) ? onCancel : onClose}
          />
        </PanelFooter>
      </Panel>
    </Dialog>
  );
};

DialogWrapper.propTypes = {
  open: propTypes.bool,
  mode: propTypes.oneOf(['confirm', 'ask']),
  isFlex: propTypes.bool,
  title: propTypes.string,
  maxWidth: propTypes.string,
  isConfirmDisabled: propTypes.bool,
  cancelText: propTypes.string,
  confirmText: propTypes.string,
  onClose: propTypes.func,
  onCancel: propTypes.func,
  onConfirm: propTypes.func.isRequired,
};

DialogWrapper.defaultProps = {
  title: '',
  maxWidth: 'md',
  mode: 'confirm',
  open: false,
  isFlex: false,
  rightTitleElement: null,
  confirmText: '完成',
  cancelText: '取消',
  isConfirmDisabled: false,
  onCancel: null,
  onClose: () => {},
};

export default withMobileDialog()(withStyles(style)(DialogWrapper));
