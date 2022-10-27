import {Objects, NodeDefs} from '@openforis/arena-core';
import {createCachedSelector, FifoObjectCache} from 're-reselect';
import {createSelector} from 'reselect';

import {getKeyNodesForEntityAsString} from 'arena/record';
import {keySelectors, normalizeByUuid} from 'infra/stateUtils';
import recordsSelectors from 'state/records/selectors';
import {getCategoryItemIndex} from 'state/survey/selectors/base';
import * as surveySelectorsNodeDefs from 'state/survey/selectors/nodeDefs';
import * as surveySelectorsNodes from 'state/survey/selectors/nodes';

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
)(state => getRecordUuid(state) || '_');

const getNodeUuid = createSelector(
  getFormStateData,
  form => form.node || false,
);
const getParentEntityNodeUuid = createSelector(
  getFormStateData,
  form => form.parentEntityNode || false,
);
const getParentEntityNodeUuidKey = createSelector(
  getParentEntityNodeUuid,
  parentEntityNode => parentEntityNode || '_',
);

const getEntityNodeUuid = createSelector(
  getFormStateData,
  form => form.entityNode || false,
);

const getRecordNodes = createSelector(
  surveySelectorsNodes.getNodes,
  getRecordUuid,
  (nodes, recordUuid) => nodes.filter(node => node.recordUuid === recordUuid),
);

const getRecordNodesByUuid = createSelector(getRecordNodes, normalizeByUuid);

const getNode = createCachedSelector(
  getRecordNodesByUuid,
  getNodeUuid,
  (nodes, nodeUuid) => nodes[nodeUuid] || false,
)(state => getNodeUuid(state) || '_');

const getParentEntityNode = createCachedSelector(
  getRecordNodesByUuid,
  getParentEntityNodeUuid,
  (nodes, parentEntityNodeUuid) => nodes[parentEntityNodeUuid] || false,
)(getParentEntityNodeUuidKey);

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
const getNodeDefUuidKey = createSelector(
  getNodeDefUuid,
  nodeDef => nodeDef || '_',
);

const isNodeDefApplicable = createCachedSelector(
  getParentEntityNode,
  (_, nodeDefUuid) => nodeDefUuid,
  (parentEntityNode, nodeDefUuid) =>
    !Object.keys(parentEntityNode?.meta?.childApplicability || {}).includes(
      nodeDefUuid,
    ),
)(keySelectors.stringKey);

const getParentEntityNodeDefUuid = createSelector(
  getFormStateData,
  form => form.parentEntityNodeDef || false,
);
const getParentEntityNodeDefUuidKey = createSelector(
  getParentEntityNodeDefUuid,
  parentEntityNodeDef => parentEntityNodeDef || '_',
);

const getNodeDef = createCachedSelector(
  surveySelectorsNodeDefs.getNodeDefsByUuid,
  getNodeDefUuid,
  (nodeDefsByUuid, nodeDefUuid) => nodeDefsByUuid[nodeDefUuid],
)(getNodeDefUuidAndNodeUuid);

const getParentEntityNodeDef = createCachedSelector(
  surveySelectorsNodeDefs.getNodeDefsByUuid,
  getParentEntityNodeDefUuid,
  (nodeDefsByUuid, parentEntityNodeDefUuid) =>
    nodeDefsByUuid[parentEntityNodeDefUuid],
)(getParentEntityNodeDefUuidKey);

const getNodeDefChildren = createCachedSelector(
  surveySelectorsNodeDefs.getNodeDefs,
  getNodeDefUuid,
  (nodeDefs, nodeDefUuid) =>
    nodeDefs.filter(
      ({parentUuid}) => !!parentUuid && parentUuid === nodeDefUuid,
    ),
)(getNodeDefUuidKey);

const getNodeDefChildrenAttributes = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.filter(({type}) => type !== 'entity'),
)(getNodeDefUuidKey);

const getNodeDefChildrenUuids = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.map(({uuid}) => uuid),
)(getNodeDefUuidKey);

const getNodeDefChildrenAttributesUuids = createCachedSelector(
  getNodeDefChildrenAttributes,
  nodeDefs => nodeDefs.map(({uuid}) => uuid),
)(getNodeDefUuidKey);

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

const getHierarchyUuid = createCachedSelector(getHierarchy, hierarchy =>
  hierarchy.map(h => h.uuid),
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
  surveySelectorsNodeDefs.getNodeDefsByUuid,
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

const getNodeDefNodesInHierarchy = createCachedSelector(
  getRecordNodes,
  getHierarchyUuid,
  (_, nodeDef) => nodeDef,
  (nodes, hierarchyUuids, nodeDef) =>
    nodes.filter(
      node =>
        node.nodeDefUuid === nodeDef?.uuid &&
        hierarchyUuids.includes(node.parentUuid),
    ),
)((_state_, nodeDef) => nodeDef?.uuid || '__');

const getEntityKey = createCachedSelector(
  getRecordNodes,
  surveySelectorsNodeDefs.getNodeDefsByUuid,
  (_, entity) => entity,
  getCategoryItemIndex,
  (nodes, nodeDefsByUuid, entity, categoryItemIndex) =>
    getKeyNodesForEntityAsString({
      nodes,
      entity,
      nodeDefsByUuid,
      categoryItemIndex,
    }),
)((_state_, entity) => entity?.uuid || '_');

const getNodeDefNodesWithKeysAsStringInHierarchy = createCachedSelector(
  getRecordNodes,
  getHierarchyUuid,
  (_, nodeDef) => nodeDef,
  surveySelectorsNodeDefs.getNodeDefsByUuid,
  getCategoryItemIndex,
  (nodes, hierarchyUuids, nodeDef, nodeDefsByUuid, categoryItemIndex) =>
    nodes
      .filter(
        node =>
          node.nodeDefUuid === nodeDef.uuid &&
          hierarchyUuids.includes(node.parentUuid),
      )
      .map(node => {
        const keyString = getKeyNodesForEntityAsString({
          nodes,
          entity: node,
          nodeDefsByUuid,
          categoryItemIndex,
        });

        return Object.assign({}, node, {keyString});
      }),
)((_state_, nodeDef) => nodeDef?.uuid || '_');

const _getDescendants = ({nodes, node}) => {
  let descendants = [];
  for (let _node of nodes) {
    if (_node.parentUuid === node.uuid) {
      descendants.push(_node, ..._getDescendants({nodes, node: _node}));
    }
  }
  return descendants;
};

const getNodeChildren = createCachedSelector(
  getRecordNodes,
  (_, node) => node,
  (recordNodes, node) => {
    const children = [];
    for (let _node of recordNodes) {
      if (_node.parentUuid === node.uuid) {
        children.push(_node);
      }
    }
    return children;
  },
)((_state_, node) => node?.uuid || '_');

const getNodeDescendants = createCachedSelector(
  getRecordNodes,
  (_, node) => node,
  (recordNodes, node) => _getDescendants({nodes: recordNodes, node}),
)((_state_, node) => node?.uuid || '_');

const getNodeDescendantsByNodeDefUuid = createCachedSelector(
  getNodeDescendants,
  (_, __, nodeDefUuid) => nodeDefUuid,
  (descendants, nodeDefUuid) =>
    descendants.filter(node => node.nodeDefUuid === nodeDefUuid),
)((_state_, node, nodeDefUuid) => `${node.uuid}_${nodeDefUuid}`);

// --- UI
const isEntitySelectorOpened = createSelector(
  getFormStateUi,
  ui => ui?.isEntitySelectorOpened || false,
);

// --- Validation
const getValidation = createSelector(
  getFormState,
  formState => formState.validation || {},
);

const getValidationByKeys = ({keys, validation}) => {
  let _validation = {};

  Object.entries(validation?.fields || {}).some(([fieldKey, fieldValue]) => {
    if (keys.includes(fieldKey)) {
      _validation = Object.assign({}, fieldValue);
      return true;
    }
    if (!Objects.isEmpty(fieldValue)) {
      _validation = getValidationByKeys({
        keys,
        validation: fieldValue.value,
      });
      if (!Objects.isEmpty(_validation)) {
        return true;
      }
    }
    return false;
  });

  return _validation;
};

const getValidationByNodes = createCachedSelector(
  getValidation,
  (_, nodes) => nodes?.map(node => node.uuid) || [],
  (validation, nodesUuids) =>
    getValidationByKeys({keys: nodesUuids, validation}),
)({
  keySelector: (_state_, nodes) =>
    nodes?.map(node => node.uuid).join('_') || '_',
  cacheObject: new FifoObjectCache({cacheSize: 1000}),
});

const canAddNode = createCachedSelector(
  (_, nodeDef) => nodeDef,
  getNodeDefNodesInHierarchy,
  (nodeDef, nodeDefNodesInHierarchy = []) => {
    const maxCount = NodeDefs.getMaxCount(nodeDef);
    return (
      nodeDef &&
      NodeDefs.isMultiple(nodeDef) &&
      (Objects.isEmpty(maxCount) ||
        nodeDefNodesInHierarchy.length < Number(maxCount))
    );
  },
)(keySelectors.getUuidFromItem);

export default {
  getFormStateData,
  getRecordUuid,

  getRecord,
  getRecordNodes,
  getRecordNodesByUuid,

  getParentEntityNodeDef,
  getParentEntityNode,

  getNode,
  getNodeDef,

  isNodeDefApplicable,
  canAddNode,
  getNodeChildren,
  getNodeDefChildren,
  getNodeDefChildrenAttributes,
  getNodeDefChildrenUuids,
  getNodeDefChildrenAttributesUuids,
  getHierarchy,
  getEntityNode,

  getHierarchyNodeDefUuids,
  getBreadCrumbs,
  getNodeDefNodes,
  getNodeDefNodesInHierarchy,
  getEntityKey,
  getNodeDefNodesWithKeysAsStringInHierarchy,

  getNodeDescendants,

  getNodeDescendantsByNodeDefUuid,

  // ---- UI
  isEntitySelectorOpened,

  // ---- Validation
  getValidation,
  getValidationByNodes,
};
