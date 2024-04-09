import React, { Fragment } from 'react';
import { withStyles } from '@material-ui/styles';
import Typography from '~/components/Typography';
import colors from '~/theme/colors';
import { FormGroup, FormLabel } from '../wrappers';
import isEmpty from 'lodash/isEmpty';

const styles = theme => ({
  content: {
    color: colors.greydarker,
    lineHeight: '36px',
    fontWeight: 'normal',
    [theme.breakpoints.down('md')]: {
      paddingLeft: 4,
      display: 'block',
      fontSize: '14px',
      marginBottom: 0,
    },
  },
  subtitle: {
    color: colors.secondary,
    paddingLeft: theme.spacing(2),
  },
});

const LabelText = props => {
  const {
    hide,
    title,
    subtitle,
    value,
    classes,
    children,
    ...textProps
  } = props;
  if (hide) return <Fragment />;

  const hasSubTitle = !isEmpty(subtitle);
  const displayText = isEmpty(value) ? '--' : value;

  return (
    <FormGroup>
      <FormLabel>
        {title}
        {hasSubTitle && (
          <Typography
            variant='h4'
            component='span'
            className={classes.subtitle}>
            {subtitle}
          </Typography>
        )}
      </FormLabel>
      <Typography
        variant='h4'
        component='span'
        className={classes.content}
        {...textProps}>
        {displayText}
        {children}
      </Typography>
    </FormGroup>
  );
};

export default withStyles(styles)(LabelText);
