import React from 'react';
import union from 'lodash/union';
import isEmpty from 'lodash/isEmpty';
import List from '@material-ui/core/List';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '~/components/Typography';
import CheckBox from '~/components/FormFields/CheckBox';

const handleToggle = (checkedItems, setCheckedItems) => targetItem => () => {
  const currentIndex = checkedItems.indexOf(targetItem);
  const newChecked = [...checkedItems];
  currentIndex === -1
    ? newChecked.push(targetItem)
    : newChecked.splice(currentIndex, 1);
  setCheckedItems(newChecked);
};

const handleToggleAll = (items, checkedItems, setCheckedItems) => () => {
  const shouldCancelAllToggle = checkedItems.length === items.length;
  const newItems = shouldCancelAllToggle ? [] : union(items, checkedItems);
  setCheckedItems(newItems);
};

const ItemListCollections = ({
  title,
  errorMessage,
  items,
  roleMap,
  classes,
  checkedItems,
  setCheckedItem,
}) => {
  const selecteds = items.length;
  const isSelectAllItems =
    checkedItems.length === selecteds && checkedItems.length !== 0;
  const disableSelectAll = selecteds === 0;
  const indeterminate = checkedItems.length !== 0 && !isSelectAllItems;

  const onToggle = handleToggle(checkedItems, setCheckedItem);
  const onToggleAll = handleToggleAll(items, checkedItems, setCheckedItem);
  const cardRootClass = isEmpty(errorMessage)
    ? classes.cardRoot
    : classes.cardErrorRoot;
  return (
    <div>
      <Card classes={{ root: cardRootClass }}>
        <CardHeader
          title={title}
          classes={{
            root: classes.cardHeader,
            subheader: classes.subheader,
          }}
          subheader={`已选择 ${checkedItems.length}/${selecteds}`}
          avatar={
            <CheckBox
              checked={isSelectAllItems}
              disabled={disableSelectAll}
              onClick={onToggleAll}
              indeterminate={indeterminate}
            />
          }
        />
        <Divider />
        <List className={classes.list} dense component='div' role='list'>
          {items.map(id => {
            const labelId = `transfer-list-all-item-${id}-label`;
            const checked = checkedItems.includes(id);
            const text = roleMap[id];
            return (
              <ListItem
                key={`role_item_${id}`}
                role='listitem'
                button
                onClick={onToggle(id)}>
                <ListItemIcon>
                  <CheckBox tabIndex={-1} disableRipple checked={checked} />
                </ListItemIcon>
                <ListItemText id={labelId} primary={text} />
              </ListItem>
            );
          })}
          <ListItem />
        </List>
      </Card>
      <Typography variant='h6' className={classes.cardErrorMessage}>
        {errorMessage}
      </Typography>
    </div>
  );
};

export default ItemListCollections;
