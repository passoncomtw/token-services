import React from 'react';
import propTypes from 'prop-types';
import isEmpty from 'lodash/isEmpty';
import { withStyles, Box } from '@material-ui/core';
import Typography from '~/components/Typography';
import Button from '~/components/Buttons';
import { FormGroup, FormLabel } from '../wrappers';

const styles = (theme) => ({
  content: {
    lineHeight: '36px',
    paddingRight: 10,
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      paddingLeft: 4,
      display: 'block',
      fontSize: '14px',
      marginBottom: 0,
      marginRight: theme.spacing(0),
    },
  },
  button: {
    marginLeft: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      marginLeft: theme.spacing(1),
    },
  },
});

const ButtonField = (props) => {
  const {
    hide,
    classes,
    title = '',
    content = '',
    buttonText = '',
    variant = 'contained',
    onClick = () => false,
  } = props;
  if (hide) return null;
  return (
    <FormGroup>
      <FormLabel>{title}</FormLabel>
      <Box display="flex" flexDirection="row">
        <Typography
          hide={isEmpty(content)}
          variant="h4"
          component="span"
          className={classes.content}
        >
          {content}
        </Typography>
        <Button
          className={classes.button}
          text={buttonText}
          variant={variant}
          onClick={onClick}
        />
      </Box>
    </FormGroup>
  );
};

ButtonField.propTypes = {
  title: propTypes.string,
  content: propTypes.string,
  buttonText: propTypes.string,
  variant: propTypes.oneOf(['contained', 'outlined', 'text']),
  onClick: propTypes.func,
};

export default withStyles(styles)(ButtonField);
