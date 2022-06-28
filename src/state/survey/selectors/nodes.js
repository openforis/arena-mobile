import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import nodesSelectors from 'state/nodes/selectors';

import {getSurvey} from './base';
import {getNodeDefsByUuid} from './nodeDefs';

// --- Nodes -> maybe move as above to the form

export const getNodes = createSelector(
  getSurvey,
  nodesSelectors.getNodes,
  (survey, nodes) =>
    (nodes || []).filter(node => node.surveyUuid === survey?.uuid),
);

export const getEntityNodeKeys = createCachedSelector(
  nodesSelectors.getNodes,
  getNodeDefsByUuid,
  (_, node) => node.uuid,
  (nodes, nodeDefsByUuid, nodeUuid) =>
    nodes.filter(
      n => n.parentUuid === nodeUuid && nodeDefsByUuid[n.nodeDefUuid].props.key,
    ),
)((_state_, node) => node.uuid);

export const getEntityNodeKeysAsString = createCachedSelector(
  getEntityNodeKeys,
  nodeKeys => nodeKeys.map(nodeKey => nodeKey.value).join(','),
)((_state_, node) => node?.uuid || '_');
