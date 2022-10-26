import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {getKeyNodesAsString} from 'arena/record';
import nodesSelectors from 'state/nodes/selectors';

import {getSurvey, getCategoryItemIndex} from './base';
import {getNodeDefsByUuid} from './nodeDefs';

// --- Nodes -> maybe move as above to the form

export const getNodes = createSelector(
  getSurvey,
  nodesSelectors.getNodes,
  (survey, nodes) =>
    (nodes || []).filter(node => node.surveyUuid === survey?.uuid),
  {
    memoizeOptions: {maxSize: 10},
  },
);

export const getEntityNodeKeys = createCachedSelector(
  nodesSelectors.getNodes,
  getNodeDefsByUuid,
  (_, node) => node.uuid,
  (nodes, nodeDefsByUuid, nodeUuid) =>
    nodes.filter(
      n => n.parentUuid === nodeUuid && nodeDefsByUuid[n.nodeDefUuid].props.key,
    ),
)((_state_, node) => node?.uuid || '_');

export const getEntityNodeKeysAsString = createCachedSelector(
  getEntityNodeKeys,
  getCategoryItemIndex,
  (nodeKeys, categoryItemIndex = {}) =>
    getKeyNodesAsString({nodes: nodeKeys, categoryItemIndex}),
)((_state_, node) => node?.uuid || '_');
