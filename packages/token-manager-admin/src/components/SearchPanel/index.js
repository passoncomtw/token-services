import React from 'react';
import propTypes from 'prop-types';
import { Grid, Box } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import Button from '~/components/Buttons';
import TextButton from '~/components/Buttons/TextButton';
import { Panel } from '~/components/Panels';

const styles = theme => ({
  buttonZone: {
    display: 'flex',
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
    padding: theme.spacing(1),
    [theme.breakpoints.up('lg')]: {
      maxWidth: 135,
    },
  },
});

const SearchContent = ({ children, onSearch, onReset, classes }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={12} lg xl={11}>
        {children}
      </Grid>
      <Grid item xs={12} md={12} lg={2} xl={1} className={classes.buttonZone}>
        <TextButton text='重置' onClick={onReset} />
        <Button text='篩選' onClick={onSearch} />
      </Grid>
    </Grid>
  );
};

const SearchPanel = props => {
  const { children, onSearch, onReset, classes, withoutPanel = false } = props;

  if (withoutPanel) {
    return (
      <SearchContent classes={classes} onSearch={onSearch} onReset={onReset}>
        {children}
      </SearchContent>
    );
  }

  return (
    <Panel>
      <Box pt={1} pb={3} px={3}>
        <SearchContent classes={classes} onSearch={onSearch} onReset={onReset}>
          {children}
        </SearchContent>
      </Box>
    </Panel>
  );
};

SearchPanel.propTypes = {
  withoutPanel: propTypes.bool,
  onReset: propTypes.func.isRequired,
  onSearch: propTypes.func.isRequired,
};

export default withStyles(styles)(SearchPanel);
