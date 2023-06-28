import {createCachedSelector, FifoObjectCache} from 're-reselect';
import {createSelector} from 'reselect';

import {EMPTY_OBJECT, keySelectors, normalizeByUuid} from 'infra/stateUtils';

const getState = state => state;
const getNodesState = createSelector(
  getState,
  state => state?.nodes || EMPTY_OBJECT,
);

const getUiState = createSelector(
  getNodesState,
  state => state?.ui || EMPTY_OBJECT,
);

const getNodesByUuid = createSelector(
  getNodesState,
  state => state?.data || EMPTY_OBJECT,
);

const getNodes = createSelector(getNodesByUuid, nodes => Object.values(nodes), {
  memoizeOptions: {maxSize: 3},
});
const getNumNodes = createSelector(getNodes, nodes => nodes.length);

const getNodeByUuid = createCachedSelector(
  getNodesByUuid,
  keySelectors.nodeUuid,
  (nodessByUuid, nodeUuid) => nodessByUuid[nodeUuid] || false,
)(keySelectors.nodeUuid);

const getNodesByRecordUuid = createCachedSelector(
  getNodes,
  keySelectors.recordUuid,
  (nodes, recordUuid) => nodes.filter(node => node.recordUuid === recordUuid),
)(keySelectors.recordUuid);

const getNodesByUuidRecordUuid = createCachedSelector(
  getNodesByRecordUuid,
  nodes => normalizeByUuid(nodes),
)({
  keySelector: keySelectors.recordUuid,
  cacheObject: new FifoObjectCache({cacheSize: 5}),
});

const getLastNodeDefUuid = createSelector(getUiState, ui => ui.lastNodeDefUuid);

export default {
  getNodes,
  getNumNodes,
  getNodeByUuid,
  getNodesByRecordUuid,
  getNodesByUuidRecordUuid,

  getLastNodeDefUuid,
};
