import {NodeDefs, RecordValidations} from '@openforis/arena-core';
import {createCachedSelector, FifoObjectCache} from 're-reselect';
import {createSelector} from 'reselect';

import {getKeyNodesForEntityAsString, joinRecordItems} from 'arena/record';
import {Objects} from 'infra/objectUtils';
import {
  keySelectors,
  normalizeByUuid,
  EMPTY_OBJECT,
  DEFAULT_NO_KEY,
} from 'infra/stateUtils';
import recordsSelectors from 'state/records/selectors';
import {getCategoryItemIndex} from 'state/survey/selectors/base';
import * as surveySelectorsBase from 'state/survey/selectors/base';
import * as surveySelectorsNodeDefs from 'state/survey/selectors/nodeDefs';
import * as surveySelectorsNodes from 'state/survey/selectors/nodes';

const getState = state => state;
const getFormState = createSelector(
  getState,
  state => state?.form || EMPTY_OBJECT,
);
const getFormStateData = createSelector(
  getFormState,
  state => state?.data || EMPTY_OBJECT,
);
const getFormStateUi = createSelector(
  getFormState,
  state => state?.ui || EMPTY_OBJECT,
);

const getRecordUuid = createSelector(
  getFormStateData,
  form => form.record || false,
);
const getRecord = createCachedSelector(
  recordsSelectors.getRecordsByUuid,
  getRecordUuid,
  (records, recordUuid) => records[recordUuid] || false,
)(state => getRecordUuid(state) || DEFAULT_NO_KEY);

const isRecordLocked = createSelector(
  getRecord,
  record => record?.locked || false,
);

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
  parentEntityNode => parentEntityNode || DEFAULT_NO_KEY,
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
)(state => getNodeUuid(state) || DEFAULT_NO_KEY);

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
  nodeDef => nodeDef || DEFAULT_NO_KEY,
);

const _getNodeDefUuid = (_, nodeDefUuid) => nodeDefUuid;
const isNodeDefApplicable = createCachedSelector(
  getParentEntityNode,
  _getNodeDefUuid,
  (parentEntityNode, nodeDefUuid) =>
    !Object.keys(
      parentEntityNode?.meta?.childApplicability || EMPTY_OBJECT,
    ).includes(nodeDefUuid),
)({
  keySelector: keySelectors.stringKey,
  cacheObject: new FifoObjectCache({cacheSize: 4000}),
});

const _getNodeDef = (_, nodeDef) => nodeDef;
const isNodeDefDisabled = createCachedSelector(
  getParentEntityNode,
  _getNodeDef,
  (parentEntityNode, nodeDef) => {
    const applicable = !Object.keys(
      parentEntityNode?.meta?.childApplicability || EMPTY_OBJECT,
    ).includes(nodeDef.uuid);
    return !applicable || NodeDefs.isReadOnly(nodeDef);
  },
)({
  keySelector: keySelectors.getUuidFromItem,
  cacheObject: new FifoObjectCache({cacheSize: 100}),
});

const getParentEntityNodeDefUuid = createSelector(
  getFormStateData,
  form => form.parentEntityNodeDef || false,
);
const getParentEntityNodeDefUuidKey = createSelector(
  getParentEntityNodeDefUuid,
  parentEntityNodeDef => parentEntityNodeDef || DEFAULT_NO_KEY,
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

const getAncestorsOfNode = createCachedSelector(
  getRecordNodesByUuid,
  keySelectors.nodeUuid,
  (nodesByUuid, nodeUuid) => {
    const node = nodesByUuid[nodeUuid];
    const ancestors = node ? getAncestors({node, nodesByUuid}) : [];
    return ancestors.reverse();
  },
)(keySelectors.nodeUuid);

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
  keySelectors.identity,
  (nodes, nodeDef) => nodes.filter(node => node.nodeDefUuid === nodeDef.uuid),
)((_state_, nodeDef) => nodeDef.uuid);

const getNodeDefNodesInHierarchy = createCachedSelector(
  getRecordNodes,
  getHierarchyUuid,
  keySelectors.identity,
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
  surveySelectorsBase.getTaxonIndex,
  (nodes, nodeDefsByUuid, entity, categoryItemIndex, taxonIndex) =>
    getKeyNodesForEntityAsString({
      nodes,
      entity,
      nodeDefsByUuid,
      categoryItemIndex,
      taxonIndex,
    }),
)((_state_, entity) => entity?.uuid || DEFAULT_NO_KEY);

const getNodeDefNodesWithKeysAsStringInHierarchy = createCachedSelector(
  getRecordNodes,
  getHierarchyUuid,
  keySelectors.identity,
  surveySelectorsNodeDefs.getNodeDefsByUuid,
  getCategoryItemIndex,
  surveySelectorsBase.getTaxonIndex,
  (
    nodes,
    hierarchyUuids,
    nodeDef,
    nodeDefsByUuid,
    categoryItemIndex,
    taxonIndex,
  ) =>
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
          taxonIndex,
        });

        return {...node, keyString};
      }),
)((_state_, nodeDef) => nodeDef?.uuid || DEFAULT_NO_KEY);

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
)((_state_, node) => node?.uuid || DEFAULT_NO_KEY);

const getNodeDescendants = createCachedSelector(
  getRecordNodes,
  (_, node) => node,
  (recordNodes, node) => _getDescendants({nodes: recordNodes, node}),
)((_state_, node) => node?.uuid || DEFAULT_NO_KEY);

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

const isEntityShowAsTable = createSelector(
  getFormStateUi,
  ui => ui?.isEntityShowAsTable || false,
);

const isSingleNodeView = createSelector(
  getFormStateUi,
  ui => ui?.isSingleNodeView || false,
);

// --- Validation
const getValidation = createSelector(
  getFormState,
  formState => formState.validation || EMPTY_OBJECT,
);

const getValidationByKeys = ({keys, validation}) => {
  return keys
    .map(nodeUuid =>
      RecordValidations.getValidationNode({
        nodeUuid,
      })(validation),
    )
    .reduce((acc, curr) => {
      return {
        ...acc,
        ...curr,
      };
    }, EMPTY_OBJECT);
};

const _getNodesUuids = (_, nodes) => nodes?.map(node => node.uuid) || [];

const getValidationByNodes = createCachedSelector(
  getValidation,
  _getNodesUuids,
  (validation, nodesUuids) =>
    getValidationByKeys({keys: nodesUuids, validation}),
)({
  keySelector: keySelectors.mapItemsUuid,
  cacheObject: new FifoObjectCache({cacheSize: 100}),
});

const canAddNode = createCachedSelector(
  keySelectors.identity,
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

const generatePositionStringIndex = item => {
  const {x, y} = item;
  return `${(String(y) || '0').padStart(5, '0')}_${(String(x) || '0').padStart(
    5,
    '0',
  )}`;
};

const _sorter = (a, b) => {
  const aIndex = generatePositionStringIndex(a);
  const bIndex = generatePositionStringIndex(b);

  return aIndex > bIndex ? 1 : -1;
};

const getNodeDefAttributeUuidsSorted = ({
  nodeDefUuidsInEntity = [],
  isTable,
}) => {
  let formAttributesNodeDefs = isTable
    ? nodeDefUuidsInEntity
    : nodeDefUuidsInEntity
        ?.sort(_sorter)
        .map(children => children?.i || children);

  return formAttributesNodeDefs;
};

const getFormAttributesNodeDefs = createSelector(
  getParentEntityNodeDef,
  surveySelectorsNodeDefs.getNodeDefsByUuid,
  surveySelectorsBase.getSurveyCycle,
  getParentEntityNode,
  (parentEntityNodeDef, nodeDefsByUuid, cycle, parentEntityNode) => {
    const isTable =
      NodeDefs.getLayoutRenderType(cycle)(parentEntityNodeDef) === 'table';

    const nodeDefUuidsInEntity =
      parentEntityNodeDef.props.layout[cycle]?.layoutChildren;
    const parentChildApplicability = parentEntityNode?.meta?.childApplicability;
    const parentChildApplicabilityKeys = Object.keys(
      parentChildApplicability || EMPTY_OBJECT,
    );

    let formAttributesNodeDefs = getNodeDefAttributeUuidsSorted({
      nodeDefUuidsInEntity,
      isTable,
    });

    formAttributesNodeDefs = formAttributesNodeDefs
      ?.map(nodeDefUuid => nodeDefsByUuid[nodeDefUuid])
      .filter(_nodeDef => {
        if (Objects.isEmpty(_nodeDef)) {
          return false;
        }
        if (_nodeDef?.props?.hidden) {
          return false;
        }

        const layoutProps = NodeDefs.getLayoutProps(cycle)(_nodeDef);

        if (layoutProps?.hiddenInMobile === true) {
          return false;
        }

        return !(
          parentChildApplicabilityKeys.includes(_nodeDef?.uuid) &&
          parentChildApplicability?.[_nodeDef?.uuid] === false
        );
      });

    return formAttributesNodeDefs;
  },
);

const getFormAttributesNodeDefsUuids = createSelector(
  getFormAttributesNodeDefs,
  nodeDefs => nodeDefs.map(nodeDef => nodeDef?.uuid),
);

const getFullRecord = createSelector(
  getRecord,
  getRecordNodesByUuid,
  getValidation,
  (record, nodesByUuid, validation) =>
    joinRecordItems({record, nodesByUuid, validation}),
);

export default {
  getFormStateData,
  getRecordUuid,

  getRecord,
  getFullRecord,
  isRecordLocked,
  getRecordNodes,
  getRecordNodesByUuid,

  getParentEntityNodeDef,
  getParentEntityNode,

  getNode,
  getNodeDef,

  isNodeDefApplicable,
  isNodeDefDisabled,
  canAddNode,
  getNodeChildren,
  getNodeDefChildren,
  getNodeDefChildrenAttributes,
  getNodeDefChildrenUuids,
  getNodeDefChildrenAttributesUuids,
  getHierarchy,
  getAncestorsOfNode,
  getEntityNode,

  getHierarchyNodeDefUuids,
  getBreadCrumbs,
  getNodeDefNodes,
  getNodeDefNodesInHierarchy,
  getEntityKey,
  getNodeDefNodesWithKeysAsStringInHierarchy,

  getNodeDescendants,

  getNodeDescendantsByNodeDefUuid,
  getFormAttributesNodeDefs,
  getFormAttributesNodeDefsUuids,

  // ---- UI
  isEntitySelectorOpened,
  isEntityShowAsTable,
  isSingleNodeView,

  // ---- Validation
  getValidation,
  getValidationByNodes,
};
