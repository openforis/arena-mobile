import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import recordsSelectors from 'state/records/selectors';
import surveySelectors from 'state/survey/selectors';

const getState = state => state;
const getFormState = createSelector(getState, state => state?.form || {});
const getFormStateData = createSelector(
  getFormState,
  state => state?.data || {},
);
const getFormStateUi = createSelector(getFormState, state => state?.ui || {});

const getRecordUuid = createSelector(
  getFormStateData,
  form => form.record || false,
);
const getRecord = createCachedSelector(
  recordsSelectors.getRecordsByUuid,
  getRecordUuid,
  (records, recordUuid) => records[recordUuid] || false,
)(getRecordUuid);

const getNodeUuid = createSelector(
  getFormStateData,
  form => form.node || false,
);

const getParentNodeUuid = createSelector(
  getFormStateData,
  form => form.parentNode || false,
);

const getRecordNodes = createSelector(
  surveySelectors.getNodes,
  getRecordUuid,
  (nodes, record) => nodes.filter(node => node.recordUuid === record),
);

const getRecordNodesByUuid = createSelector(getRecordNodes, nodes =>
  nodes.reduce((acc, node) => ({...acc, [node.uuid]: {...node}}), {}),
);

const getNode = createCachedSelector(
  getRecordNodesByUuid,
  getNodeUuid,
  (nodes, nodeUuid) => nodes[nodeUuid] || false,
)(getNodeUuid);

const getNodeDefUuidAndNodeUuid = createSelector(
  getFormStateData,
  form => `${form.node}.${form.nodeDef}`,
);

const getNodeDefUuidAndNodeUuidAndParentNodeUuid = createSelector(
  getFormStateData,
  form => `${form.nodeDef}.${form.node}.${form.parentNode}`,
);

const getNodeDefUuid = createSelector(
  getFormStateData,
  form => form.nodeDef || false,
);

const getNodeDef = createCachedSelector(
  surveySelectors.getNodeDefsByUuid,
  getNodeDefUuid,
  (nodeDefsByUuid, nodeDefUuid) => nodeDefsByUuid[nodeDefUuid],
)(getNodeDefUuid);

const getNodeDefChildren = createCachedSelector(
  surveySelectors.getNodeDefs,
  getNodeDefUuid,
  (nodeDefs, nodeDefUuid) =>
    nodeDefs.filter(
      ({parentUuid}) => !!parentUuid && parentUuid === nodeDefUuid,
    ),
)(getNodeDefUuid);

const getAncestors = ({node, nodesByUuid}) => {
  return [
    node,
    ...(node.parentUuid
      ? getAncestors({
          node: nodesByUuid[node.parentUuid],
          nodesByUuid,
        })
      : []),
  ];
};

const getHierarchy = createCachedSelector(
  getRecordNodesByUuid,
  getNodeUuid,
  (nodesByUuid, nodeUuid) => {
    const node = nodesByUuid[nodeUuid];
    const ancestors = node ? getAncestors({node, nodesByUuid}) : [];
    return ancestors.reverse();
  },
)(getNodeDefUuidAndNodeUuid);

const getHierarchyNodeDefUuids = createCachedSelector(getHierarchy, hierarchy =>
  hierarchy.map(h => h.nodeDefUuid),
)(getNodeDefUuidAndNodeUuid);

const getParentNode = createCachedSelector(
  getRecordNodesByUuid,
  getParentNodeUuid,
  (nodesByUuid, nodeUuid) => nodesByUuid[nodeUuid] || false,
)(getNodeDefUuidAndNodeUuidAndParentNodeUuid);

const getBreadCrumbs = createCachedSelector(
  getHierarchy,
  surveySelectors.getNodeDefsByUuid,
  (hierarchy, nodeDefsByUuid) => {
    return hierarchy.filter(
      breadCrumb => nodeDefsByUuid[breadCrumb.nodeDefUuid].type === 'entity',
    );
  },
)(getNodeDefUuidAndNodeUuid);

const getNodeDefNodes = createCachedSelector(
  getRecordNodes,
  (_, nodeDef) => nodeDef,
  (nodes, nodeDef) => nodes.filter(node => node.nodeDefUuid === nodeDef.uuid),
)((_state_, nodeDef) => nodeDef.uuid);

const _getDescendants = ({nodes, node}) => {
  let descendants = [];
  for (let _node of nodes) {
    if (_node.parentUuid === node.uuid) {
      descendants.push(_node, ..._getDescendants({nodes, node: _node}));
    }
  }
  return descendants;
};

const getNodeDescendants = createCachedSelector(
  getRecordNodes,
  (_, node) => node,
  (recordNodes, node) => _getDescendants({nodes: recordNodes, node}),
)((_state_, node) => node.uuid);

const getNodeSibilings = createCachedSelector(
  getRecordNodes,
  (_, node) => node,
  (recordNodes, node) =>
    recordNodes.filter(
      _node =>
        _node.nodeDefUuid === node.nodeDefUuid &&
        _node.parentUuid === node.parentUuid &&
        _node.uuid !== node.uuid,
    ),
)((_state_, node) => node.uuid);

// --- UI
const isEntitySelectorOpened = createSelector(
  getFormStateUi,
  ui => ui?.isEntitySelectorOpened || false,
);

export default {
  getRecordUuid,

  getRecord,
  getRecordNodes,
  getNode,
  getNodeDef,
  getNodeDefChildren,
  getHierarchy,
  getParentNode,

  getHierarchyNodeDefUuids,
  getBreadCrumbs,
  getNodeDefNodes,

  getNodeDescendants,
  getNodeSibilings,

  // ---- UI
  isEntitySelectorOpened,
};
