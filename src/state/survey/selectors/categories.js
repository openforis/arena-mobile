import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import formSelectors from 'state/form/selectors';

import {getSurvey, getRefData} from './base';
import {getNodeDefByUuid, getNodeDefsByUuid} from './nodeDefs';

// --- NodeDefs
export const getCategories = createSelector(
  getSurvey,
  survey => survey.categories,
);

export const getCategoryItemUuidIndex = createSelector(
  getRefData,
  refData => refData?.categoryItemUuidIndex,
);

export const getCategoryItemIndex = createSelector(
  getRefData,
  refData => refData?.categoryItemIndex,
);

const getNodeDefCategoryIndex = createCachedSelector(
  getNodeDefByUuid,
  getNodeDefsByUuid,
  (nodeDef, nodeDefsByUuid) => {
    let index = 0;
    let parentCodeDef = nodeDef.props.parentCodeDefUuid;
    while (parentCodeDef !== null) {
      index = index + 1;
      parentCodeDef =
        nodeDefsByUuid[parentCodeDef]?.props?.parentCodeDefUuid || null;
    }
    return index;
  },
)((_state_, nodeDefUuid) => nodeDefUuid);

export const getCategoryItems = createCachedSelector(
  getCategories,
  getCategoryItemIndex,
  getNodeDefByUuid,
  getNodeDefCategoryIndex,
  (categories, categoryItemIndex, nodeDef, index) => {
    const categoryUuid = nodeDef.props.categoryUuid;
    const category = categories[categoryUuid];
    const level = category?.levels[index];

    const categoryItems = Object.values(categoryItemIndex).filter(
      item => item.levelUuid === level?.uuid,
    );
    return categoryItems;
  },
)((_state_, nodeDefUuid) => nodeDefUuid || '__');

export const getParentCodeNodeDef = createSelector(
  getNodeDefsByUuid,
  (_, __, node) => node,
  (nodeDefsByUuid, node) => {
    let parentCodeDefUuid =
      nodeDefsByUuid[node.nodeDefUuid]?.props?.parentCodeDefUuid;
    if (parentCodeDefUuid) {
      return nodeDefsByUuid[parentCodeDefUuid];
    }
    return false;
  },
);

export const getParentCodeNode = createSelector(
  state => state,
  getParentCodeNodeDef,
  (state, parentCodeNodeDef) => {
    if (parentCodeNodeDef) {
      const nodeDefNodes = formSelectors.getNodeDefNodesInHierarchy(
        state,
        parentCodeNodeDef,
      );

      return nodeDefNodes[0] || false;
    }
    return false;
  },
);

export const getNodeCategoryItems = createCachedSelector(
  getCategoryItems,
  getParentCodeNode,
  (categoryItems, parentCodeNode) => {
    if (parentCodeNode) {
      return categoryItems.filter(
        categoryItem =>
          categoryItem.parentUuid === parentCodeNode?.value?.itemUuid,
      );
    }
    return categoryItems;
  },
)((_state_, nodeDefUuid, node) => `${nodeDefUuid}.${node.uuid}`);

export const getCategoryItemByUuid = createCachedSelector(
  getCategoryItemIndex,
  (_, itemUuid) => itemUuid,
  (categoryItemIndex, itemUuid) => {
    return categoryItemIndex[itemUuid];
  },
)((_state_, itemUuid) => itemUuid || '_');
