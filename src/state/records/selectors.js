import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import nodesSelectors from 'state/nodes/selectors';
import * as surveyNodeDefsSelectors from 'state/survey/selectors/nodeDefs';

const getState = state => state;
const getRecordsState = createSelector(getState, state => state?.records || {});
const getRecordStateData = createSelector(
  getRecordsState,
  state => state?.data || {},
);

const _getAllRecordsList = createSelector(getRecordStateData, records =>
  Object.values(records || {}),
);

const getRecordByUuid = createCachedSelector(
  getRecordStateData,
  (_, recordUuid) => recordUuid,
  (recordsByUuid, recordUuid) => recordsByUuid[recordUuid] || false,
)((_state, recordUuid) => recordUuid);

const gerRecordKey = createCachedSelector(
  nodesSelectors.getNodesByRecordUuid,
  surveyNodeDefsSelectors.getNodeDefRoot,
  surveyNodeDefsSelectors.getNodeDefsByUuid,
  (_, recordUuid) => recordUuid,
  (nodes, nodeDefRoot, nodeDefsByUuid, recordUuid) => {
    const rootNode = nodes.find(node => node.nodeDefUuid === nodeDefRoot.uuid);

    const keyRootNodes = nodes.filter(
      node =>
        node.parentUuid === rootNode.uuid &&
        nodeDefsByUuid[node.nodeDefUuid].props.key,
    );

    return keyRootNodes.map(node => node.value || '-').join('/');
  },
)((_state, recordUuid) => recordUuid);

export default {
  getRecordsByUuid: getRecordStateData,
  getRecords: _getAllRecordsList,
  getRecordByUuid,
  gerRecordKey,
};
