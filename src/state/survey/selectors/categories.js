import {Objects} from '@openforis/arena-core';
import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import formSelectors from 'state/form/selectors';

import {getSurvey, getCategoryItemIndex} from './base';
import {getNodeDefByUuid, getNodeDefsByUuid} from './nodeDefs';

// --- NodeDefs
export const getCategories = createSelector(
  getSurvey,
  survey => survey.categories,
);

const getNodeDefCategoryLevelIndex = createCachedSelector(
  getNodeDefByUuid,
  getNodeDefsByUuid,
  (nodeDef, nodeDefsByUuid) => {
    let levelIndex = 0;
    let parentCodeDefUuid = nodeDef.props.parentCodeDefUuid;

    while (!Objects.isEmpty(parentCodeDefUuid)) {
      levelIndex = levelIndex + 1;
      parentCodeDefUuid =
        nodeDefsByUuid[parentCodeDefUuid]?.props?.parentCodeDefUuid || null;
    }

    return levelIndex;
  },
)((_state_, nodeDefUuid) => nodeDefUuid || '__');

export const getCategoryItems = createCachedSelector(
  getCategories,
  getCategoryItemIndex,
  getNodeDefByUuid,
  getNodeDefCategoryLevelIndex,
  (categories, categoryItemIndex, nodeDef, levelIndex) => {
    const categoryUuid = nodeDef.props.categoryUuid;
    const category = categories[categoryUuid];
    const level = category?.levels[levelIndex];

    return Object.values(categoryItemIndex).filter(
      item => item.levelUuid === level?.uuid,
    );
  },
)((_state_, nodeDefUuid) => nodeDefUuid || '__');

const getParentCodeNodeDef = createSelector(
  getNodeDefsByUuid,
  (_, __, node) => node,
  (nodeDefsByUuid, node) => {
    let parentCodeDefUuid =
      nodeDefsByUuid[node?.nodeDefUuid]?.props?.parentCodeDefUuid;
    if (parentCodeDefUuid) {
      return nodeDefsByUuid[parentCodeDefUuid];
    }
    return false;
  },
);

const getParentCodeNode = createSelector(
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
)((_state_, nodeDefUuid, node) => `${nodeDefUuid}.${node?.uuid}`);

export const getCategoryItemByUuid = createCachedSelector(
  getCategoryItemIndex,
  (_, itemUuid) => itemUuid,
  (categoryItemIndex, itemUuid) => {
    return categoryItemIndex[itemUuid];
  },
)((_state_, itemUuid) => itemUuid || '_');
