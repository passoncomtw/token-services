import React, { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { TreeView as BasicTreeView, TreeItem } from '@material-ui/lab';
import { withStyles } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import CheckBox from '~/components/FormFields/CheckBox';
import { FormGroup, FormLabel } from '~/components/FormFields/wrappers';
import ValidErrorMessage from '~/components/FormFields/TextInput/ValidErrorMessage';
import Box from './Box';

const DEFAULT_EXPAND = ['1', '2', '16', '19', '21', '23', '24', '27'];

const getChildrenIds = childrenIdsByParentId => id => {
  return childrenIdsByParentId[id] || [];
};

const getRelatedParentIds = childrenIdsByParentId => childrenId => {
  return Object.keys(childrenIdsByParentId).filter(parentId =>
    childrenIdsByParentId[parentId].includes(childrenId)
  );
};

const onSelectItem = ({
  selected,
  name,
  onChange,
  handleGetChildrenIds,
  handleGetRelatedParentIds,
}) => targetId => event => {
  event.stopPropagation();
  const isSelectedBefore = selected.includes(targetId);

  // Remove related item
  if (isSelectedBefore) {
    const relatedChildrenIds = handleGetChildrenIds(targetId);
    const nodeIds = [targetId, ...relatedChildrenIds];
    const filteredIds = selected.filter(value => !nodeIds.includes(value));
    onChange({ name, value: filteredIds });
    return;
  }

  // Add related item
  const relatedParentIds = handleGetRelatedParentIds(targetId);
  const newSelected = [...selected, ...relatedParentIds, targetId];

  onChange({
    name,
    value: [...new Set(newSelected)],
  });
};

const onToggle = setExpanded => (event, nodeIds) => {
  event.stopPropagation();
  setExpanded(nodeIds);
};

const permissionItem = ({
  classes,
  selected,
  handleOnSelectItem,
  handleGetChildrenIds,
  childrenPermissionItem,
}) => permission => {
  const functionIdentify = permission.get('functionIdentify');
  const children = permission.get('children');
  const nodeId = functionIdentify.toString();
  const childrenIds = handleGetChildrenIds(nodeId);
  const isParent = childrenIds.length > 0;
  const isSelected = selected.includes(nodeId);

  return (
    <TreeItem
      key={nodeId}
      nodeId={nodeId}
      onLabelClick={handleOnSelectItem(nodeId)}
      classes={{ label: classes.label }}
      label={
        <>
          <CheckBox checked={isSelected} />
          {permission.get('functionName')}
        </>
      }>
      {isParent && childrenPermissionItem(children)}
    </TreeItem>
  );
};

const TreeView = ({
  name,
  title,
  classes,
  selected,
  onChange,
  errorMessage,
  permissionTree,
  childrenIdsByParentId,
}) => {
  const [expanded, setExpanded] = useState(DEFAULT_EXPAND);

  const childrenPermissionItem = children =>
    children.map(child => handlePermissionItem(child));

  const handleOnToggle = onToggle(setExpanded);
  const handleGetChildrenIds = getChildrenIds(childrenIdsByParentId);
  const handleGetRelatedParentIds = getRelatedParentIds(childrenIdsByParentId);
  const handleOnSelectItem = onSelectItem({
    selected,
    name,
    onChange,
    handleGetChildrenIds,
    handleGetRelatedParentIds,
  });
  const handlePermissionItem = permissionItem({
    selected,
    classes,
    handleOnSelectItem,
    handleGetChildrenIds,
    childrenPermissionItem,
  });

  return (
    <div>
      <FormGroup>
        <FormLabel>{title}</FormLabel>
        <Box isError={!isEmpty(errorMessage)}>
          <BasicTreeView
            defaultCollapseIcon={<ExpandMoreIcon color='inherit' />}
            defaultExpandIcon={<ChevronRightIcon color='inherit' />}
            expanded={expanded}
            selected={selected}
            onNodeToggle={handleOnToggle}
            multiSelect
            classes={{ root: classes.root }}>
            {childrenPermissionItem(permissionTree)}
          </BasicTreeView>
        </Box>
      </FormGroup>
      <ValidErrorMessage errorMessage={errorMessage} />
    </div>
  );
};

const styles = theme => ({
  root: {
    width: '100%',
    padding: 8,
  },
  label: {
    backgroundColor: `${theme.colors.transparent} !important`,
  },
});

export default withStyles(styles)(TreeView);
