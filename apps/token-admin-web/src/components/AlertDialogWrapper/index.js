import React from 'react';
import { withStyles, Box } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import QuestionIcon from '@material-ui/icons/HelpOutline';
import classNames from 'classnames';
import Button from '../Buttons';
import TextButton from '~/components/Buttons/TextButton';

const variantIcon = {
  success: CheckIcon,
  warning: WarningIcon,
  error: ErrorIcon,
  info: InfoIcon,
  question: QuestionIcon,
  danger: WarningIcon,
};

const style = theme => ({
  root: {
    position: 'relative',
  },
  icon: {
    fontSize: 64,
    marginBottom: 15,
  },
  success: {
    marginRight: 10,
    color: theme.palette.success.main,
  },
  error: {
    marginRight: 10,
    color: theme.palette.danger.main,
  },
  info: {
    marginRight: 10,
    color: theme.palette.info.main,
  },
  warning: {
    marginRight: 10,
    color: theme.palette.warning.main,
  },
  question: {
    marginRight: 10,
    color: theme.palette.warning.main,
  },
  danger: {
    marginRight: 10,
    color: theme.palette.danger.main,
  },
  dialogContent: {
    paddingTop: 20,
    overflowX: 'hidden',
    textAlign: 'center',
  },
  button: {
    marginRight: theme.spacing(1.5),
  },
  dialogFooter: {
    textAlign: 'center',
    padding: '1rem 3rem',
    borderTop: '1px solid #eee',
  },
});

const AlertDialogWrapper = ({
  title = '',
  classes,
  children,
  onConfirm,
  onCancel,
  confirmText = '确认',
  cancelText = '取消',
  mode = 'ask',
  open = false,
  confirmButtonProps = {},
  cancelButtonProps = {},
  level = 'info',
  fullScreen,
  ...props
}) => {
  const Icon = variantIcon[level];
  return (
    <Dialog
      fullScreen={fullScreen}
      open={open}
      onClose={onCancel}
      aria-labelledby='detail-dialog'
      className={classes.root}
      {...props}>
      <DialogContent className={classes.dialogContent}>
        <Icon className={classNames(classes[level], classes.icon)} />
        {children}
      </DialogContent>
      <Box className={classes.dialogFooter}>
        <Button
          text={confirmText}
          className={classes.button}
          onClick={onConfirm}
        />
        <TextButton
          hide={mode !== 'ask'}
          text={cancelText}
          className={classes.button}
          onClick={onCancel}
        />
      </Box>
    </Dialog>
  );
};

export default withStyles(style)(AlertDialogWrapper);
