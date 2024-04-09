import _ from 'lodash';

const isNotRoot = ({ parentId }) => !_.isNull(parentId);

const getChildren = (result, item) => {
  const newResult = [...result, item];
  return item.children
    ? item.children.reduce(getChildren, newResult)
    : newResult;
};

const combineDeepChildrenIds = relationshipByParentId => (
  result,
  children,
  key
) => {
  const allChildrenIds = children.reduce((childrenIds, childId) => {
    const matchDeepChildrenIds = relationshipByParentId[childId] || [];
    return [...childrenIds, ...matchDeepChildrenIds];
  }, children);

  return {
    ...result,
    [key]: allChildrenIds,
  };
};

export const getChildrenIdsByParentId = permissionList => {
  // to { parentId: [child, child] } ;
  const relationshipByParentId = _.chain(permissionList.toJS())
    .reduce(getChildren, [])
    .filter(isNotRoot)
    .groupBy('parentId')
    .mapValues(children =>
      _.map(children, ({ functionIdentify }) => functionIdentify.toString())
    )
    .value();
  // to { parentId: [child, ...deepChild] } ;
  const childrenIdsByParentId = _.reduce(
    relationshipByParentId,
    combineDeepChildrenIds(relationshipByParentId),
    {}
  );
  // to: { grandId: [parentId, deepParentId] } ;
  const mergeParentAndChildren = _.reduce(
    relationshipByParentId,
    combineDeepChildrenIds(childrenIdsByParentId),
    {}
  );

  return mergeParentAndChildren;
};
