import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {getRecordKey as _getRecordKey} from 'arena/record';
import nodesSelectors from 'state/nodes/selectors';
import {getCategoryItemIndex} from 'state/survey/selectors/base';
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

const getNumRecords = createSelector(
  _getAllRecordsList,
  records => records.length,
);

const getRecordByUuid = createCachedSelector(
  getRecordStateData,
  (_, recordUuid) => recordUuid,
  (recordsByUuid, recordUuid) => recordsByUuid[recordUuid] || false,
)((_state, recordUuid) => recordUuid);

const getRecordKey = createCachedSelector(
  nodesSelectors.getNodesByRecordUuid,
  surveyNodeDefsSelectors.getNodeDefRoot,
  surveyNodeDefsSelectors.getNodeDefsByUuid,
  getCategoryItemIndex,

  (nodes, nodeDefRoot, nodeDefsByUuid, categoryItemIndex) =>
    _getRecordKey(nodes, nodeDefRoot, nodeDefsByUuid, categoryItemIndex),
)((_state, recordUuid) => recordUuid);

export default {
  getRecordsByUuid: getRecordStateData,
  getRecords: _getAllRecordsList,
  getNumRecords,
  getRecordByUuid,
  getRecordKey,
};
