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
const getParentEntityNodeUuid = createSelector(
  getFormStateData,
  form => form.parentEntityNode || false,
);

const getEntityNodeUuid = createSelector(
  getFormStateData,
  form => form.entityNode || false,
);

const getRecordNodes = createSelector(
  surveySelectors.getNodes,
  getRecordUuid,
  (nodes, recordUuid) => nodes.filter(node => node.recordUuid === recordUuid),
);

const getRecordNodesByUuid = createSelector(getRecordNodes, nodes =>
  nodes.reduce((acc, node) => ({...acc, [node.uuid]: {...node}}), {}),
);

const getNode = createCachedSelector(
  getRecordNodesByUuid,
  getNodeUuid,
  (nodes, nodeUuid) => nodes[nodeUuid] || false,
)(getNodeUuid);

const getParentEntityNode = createCachedSelector(
  getRecordNodesByUuid,
  getParentEntityNodeUuid,
  (nodes, parentEntityNodeUuid) => nodes[parentEntityNodeUuid] || false,
)(getParentEntityNodeUuid);

const getNodeDefUuidAndNodeUuid = createSelector(
  getFormStateData,
  form => `${form.node}.${form.nodeDef}`,
);

const getNodeDefNodeAndEntityUuids = createSelector(
  getFormStateData,
  form => `${form.nodeDef}.${form.node}.${form.entitNode}`,
);

const getFormKeysEntities = createSelector(
  getFormStateData,
  form => `${form.parentEntityNodeDef}.${form.parentEntityNode}`,
);

const getNodeDefUuid = createSelector(
  getFormStateData,
  form => form.nodeDef || false,
);
const getParentEntityNodeDefUuid = createSelector(
  getFormStateData,
  form => form.parentEntityNodeDef || false,
);

const getNodeDef = createCachedSelector(
  surveySelectors.getNodeDefsByUuid,
  getNodeDefUuid,
  (nodeDefsByUuid, nodeDefUuid) => nodeDefsByUuid[nodeDefUuid],
)(getNodeDefUuidAndNodeUuid);

const getParentEntityNodeDef = createCachedSelector(
  surveySelectors.getNodeDefsByUuid,
  getParentEntityNodeDefUuid,
  (nodeDefsByUuid, parentEntityNodeDefUuid) =>
    nodeDefsByUuid[parentEntityNodeDefUuid],
)(getParentEntityNodeDefUuid);

const getNodeDefChildren = createCachedSelector(
  surveySelectors.getNodeDefs,
  getNodeDefUuid,
  (nodeDefs, nodeDefUuid) =>
    nodeDefs.filter(
      ({parentUuid}) => !!parentUuid && parentUuid === nodeDefUuid,
    ),
)(getNodeDefUuid);

const getNodeDefChildrenAttributes = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.filter(({type}) => type !== 'entity'),
)(getNodeDefUuid);

const getNodeDefChildrenUuids = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.map(({uuid}) => uuid),
)(getNodeDefUuid);

const getNodeDefChildrenAttributesUuids = createCachedSelector(
  getNodeDefChildrenAttributes,
  nodeDefs => nodeDefs.map(({uuid}) => uuid),
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
  getParentEntityNodeUuid,
  (nodesByUuid, nodeUuid) => {
    const node = nodesByUuid[nodeUuid];
    const ancestors = node ? getAncestors({node, nodesByUuid}) : [];
    return ancestors.reverse();
  },
)(getFormKeysEntities);

const getHierarchyNodeDefUuids = createCachedSelector(getHierarchy, hierarchy =>
  hierarchy.map(h => h.nodeDefUuid),
)(getFormKeysEntities);

const getEntityNode = createCachedSelector(
  getRecordNodesByUuid,
  getEntityNodeUuid,
  (nodesByUuid, nodeUuid) => nodesByUuid[nodeUuid] || false,
)(getNodeDefNodeAndEntityUuids);

const getBreadCrumbs = createCachedSelector(
  getHierarchy,
  surveySelectors.getNodeDefsByUuid,
  (hierarchy, nodeDefsByUuid) =>
    hierarchy.filter(
      breadCrumb => nodeDefsByUuid[breadCrumb.nodeDefUuid].type === 'entity',
    ),
)(getFormKeysEntities);

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

// TO FIX nodeDef is not a condition to be a sibling // also extract to Record and others functions using memoization
const getNodesiblings = createCachedSelector(
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
  getFormStateData,
  getRecordUuid,

  getRecord,
  getRecordNodes,

  getParentEntityNodeDef,
  getParentEntityNode,

  getNode,
  getNodeDef,

  getNodeDefChildren,
  getNodeDefChildrenAttributes,
  getNodeDefChildrenUuids,
  getNodeDefChildrenAttributesUuids,
  getHierarchy,
  getEntityNode,

  getHierarchyNodeDefUuids,
  getBreadCrumbs,
  getNodeDefNodes,

  getNodeDescendants,
  getNodesiblings,

  // ---- UI
  isEntitySelectorOpened,
};
