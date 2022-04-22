import {createSelector} from 'reselect';

const getState = state => state;
const getNodesState = createSelector(getState, state => state?.nodes || {});
const getNodesByUuid = createSelector(
  getNodesState,
  state => state?.data || {},
);

const getNodes = createSelector(getNodesByUuid, nodes => Object.values(nodes));

export default {
  getNodes,
};
