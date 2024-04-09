import { fromJS } from 'immutable';

export const getMatchedIndex = (list, value, compareKey = 'id') =>
  list.findIndex(item => {
    return item.get(compareKey) === value;
  });

export const updateList = (
  state,
  targetId,
  newValue,
  compareKey = 'id',
  listKey = 'list'
) => {
  const listState = state.get(listKey);
  const matchedIndex = getMatchedIndex(listState, targetId, compareKey);
  if (matchedIndex === -1) return state;
  return state.updateIn([listKey, matchedIndex], item => {
    return item.merge(fromJS(newValue));
  });
};

export const deleteListItem = (
  state,
  targetId,
  compareKey = 'id',
  listKey = 'list'
) => {
  const listState = state.get(listKey);
  const matchedIndex = getMatchedIndex(listState, targetId, compareKey);
  if (matchedIndex === -1) return state;
  return state
    .removeIn([listKey, matchedIndex])
    .update('total', total => fromJS(total - 1));
};
