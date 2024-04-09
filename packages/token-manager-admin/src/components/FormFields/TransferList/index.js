import React, { useState } from 'react';
import union from 'lodash/union';
import propTypes from 'prop-types';
import difference from 'lodash/difference';
import { withStyles } from '@material-ui/core/styles';
import Grid from '~/components/Grid';
import LineButton from '~/components/Buttons/LineButton';
import { FormGroup, FormLabel } from '~/components/FormFields/wrappers';
import ItemListCollections from './components/ItemListCollections';
import { isEmpty } from 'lodash';

const styles = theme => ({
  root: {
    marginTop: 0,
    justifyContent: 'left',
    [theme.breakpoints.down('md')]: {
      margin: 'auto',
    },
  },
  cardRoot: {
    boxShadow: 'none',
    border: `1px solid ${theme.colors.linelight}`,
  },
  cardErrorRoot: {
    boxShadow: 'none',
    border: `1px solid ${theme.colors.dangerlight}`,
  },
  cardErrorMessage: {
    color: theme.colors.dangerdark,
    height: 20,
    marginTop: 5,
  },
  cardHeader: {
    padding: theme.spacing(1, 2),
    color: theme.colors.secondary,
  },
  subheader: {
    color: theme.colors.greylight,
  },
  button: {
    margin: theme.spacing(0.5, 0),
    border: `1px solid ${theme.colors.secondary}`,
  },
  list: {
    height: 230,
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
  },
});

const TransferList = ({
  classes,
  name,
  title,
  required,
  allItems,
  selectedItems,
  errorMessage,
  onChange,
}) => {
  const [leftChecked, setLeftChecked] = useState([]);
  const [rightChecked, setRightChecked] = useState([]);

  const handleMoveToRight = () => {
    onChange({ name, value: union(selectedItems, leftChecked) });
    setLeftChecked([]);
  };

  const handleMoveToLeft = () => {
    onChange({ name, value: difference(selectedItems, rightChecked) });
    setRightChecked([]);
  };

  const roleMap = allItems.reduce(
    (result, { roleId, roleName }) => ({ ...result, [roleId]: roleName }),
    {}
  );
  const allItemIds = allItems.map(({ roleId }) => roleId);
  const unselectedItems = difference(allItemIds, selectedItems);
  const disableMoveToRight = leftChecked.length === 0;
  const disableMoveToLeft = rightChecked.length === 0;
  return (
    <FormGroup>
      <FormLabel hide={isEmpty(title)} required={required}>
        {title}
      </FormLabel>
      <Grid container>
        <Grid item sm={5}>
          <ItemListCollections
            title='全部角色'
            classes={classes}
            roleMap={roleMap}
            items={unselectedItems}
            checkedItems={leftChecked}
            setCheckedItem={setLeftChecked}
          />
        </Grid>
        <Grid item sm={2}>
          <Grid container direction='column' alignItems='center'>
            <LineButton
              text='&gt;'
              className={classes.button}
              onClick={handleMoveToRight}
              disabled={disableMoveToRight}
            />
            <LineButton
              text='&lt;'
              className={classes.button}
              onClick={handleMoveToLeft}
              disabled={disableMoveToLeft}
            />
          </Grid>
        </Grid>
        <Grid item sm={5}>
          <ItemListCollections
            title='已选择'
            classes={classes}
            roleMap={roleMap}
            items={selectedItems}
            checkedItems={rightChecked}
            setCheckedItem={setRightChecked}
            errorMessage={errorMessage}
          />
        </Grid>
      </Grid>
    </FormGroup>
  );
};

TransferList.propTypes = {
  title: propTypes.string,
  errorMessage: propTypes.string,
  required: propTypes.bool,
  allItems: propTypes.arrayOf(
    propTypes.shape({
      id: propTypes.number,
      text: propTypes.string,
    })
  ),
  selectedItems: propTypes.arrayOf(propTypes.number),
};

TransferList.defaultProps = {
  title: '',
  errorMessage: '',
  required: false,
  allItems: [],
  selectedIds: [],
  selectedItems: [],
};

export default withStyles(styles)(TransferList);
