import {createCachedSelector, FifoObjectCache} from 're-reselect';
import {createSelector} from 'reselect';

import {keySelectors, normalizeByUuid} from 'infra/stateUtils';

const getState = state => state;
const getNodesState = createSelector(getState, state => state?.nodes || {});
const getNodesByUuid = createSelector(
  getNodesState,
  state => state?.data || {},
);

const getNodes = createSelector(getNodesByUuid, nodes => Object.values(nodes), {
  memoizeOptions: {maxSize: 10},
});
const getNumNodes = createSelector(getNodes, nodes => nodes.length);

const getNodeByUuid = createCachedSelector(
  getNodesByUuid,
  (_, nodeUuid) => nodeUuid,
  (nodessByUuid, nodeUuid) => nodessByUuid[nodeUuid] || false,
)(keySelectors.nodeUuid);

const getNodesByRecordUuid = createCachedSelector(
  getNodes,
  (_, recordUuid) => recordUuid,
  (nodes, recordUuid) => nodes.filter(node => node.recordUuid === recordUuid),
)(keySelectors.recordUuid);

const getNodesByUuidRecordUuid = createCachedSelector(
  getNodesByRecordUuid,
  nodes => normalizeByUuid(nodes),
)({
  keySelector: keySelectors.recordUuid,
  cacheObject: new FifoObjectCache({cacheSize: 5}),
});

export default {
  getNodes,
  getNumNodes,
  getNodeByUuid,
  getNodesByRecordUuid,
  getNodesByUuidRecordUuid,
};
