import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

const getState = state => state;
const getNodesState = createSelector(getState, state => state?.nodes || {});
const getNodesByUuid = createSelector(
  getNodesState,
  state => state?.data || {},
);

const getNodes = createSelector(getNodesByUuid, nodes => Object.values(nodes));

const getNodeByUuid = createCachedSelector(
  getNodesByUuid,
  (_, nodeUuid) => nodeUuid,
  (nodessByUuid, nodeUuid) => nodessByUuid[nodeUuid] || false,
)((_state, nodeUuid) => nodeUuid);

const getNodesByRecordUuid = createCachedSelector(
  getNodes,
  (_, recordUuid) => recordUuid,
  (nodes, recordUuid) => nodes.filter(node => node.recordUuid === recordUuid),
)((_state, recordUuid) => recordUuid);

const getNodesByUuidRecordUuid = createCachedSelector(
  getNodesByRecordUuid,
  nodes => nodes.reduce((acc, node) => ({...acc, [node.uuid]: {...node}}), {}),
)((_state, recordUuid) => recordUuid);

export default {
  getNodes,
  getNodeByUuid,
  getNodesByRecordUuid,
  getNodesByUuidRecordUuid,
};
