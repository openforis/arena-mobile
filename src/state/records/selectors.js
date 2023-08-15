import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {getRecordKey as _getRecordKey} from 'arena/record';
import {keySelectors} from 'infra/stateUtils';
import nodesSelectors from 'state/nodes/selectors';
import {getCategoryItemIndex, getTaxonIndex} from 'state/survey/selectors/base';
import * as surveyNodeDefsSelectors from 'state/survey/selectors/nodeDefs';

const getState = state => state;
const getRecordsState = createSelector(getState, state => state?.records || {});
const getRecordStateData = createSelector(
  getRecordsState,
  state => state?.data || {},
);
const getRecordUiStateData = createSelector(
  getRecordsState,
  state => state?.ui || {},
);
const getRemoteRecordsSummaryState = createSelector(
  getRecordsState,
  state => state?.remoteRecordsSummary || {},
);

const isRemoteRecordsSummaryReady = createSelector(
  getRemoteRecordsSummaryState,
  remoteRecordsSummary => remoteRecordsSummary.isReady,
);

const getRemoteRecordsSummaryLastCheck = createSelector(
  getRemoteRecordsSummaryState,
  remoteRecordsSummary => remoteRecordsSummary.lastCheck,
);

const getRemoteRecordSummary = createCachedSelector(
  getRemoteRecordsSummaryState,
  keySelectors.recordUuid,
  (recordsSummary, recordUuid) => recordsSummary[recordUuid] || false,
)(keySelectors.recordUuid);

const getIsGettingRemoteRecordsSummary = createSelector(
  getRecordUiStateData,
  state => state.isGettingRemoteRecordsSummary || false,
);

const getIsGettingRemoteRecordsSummaryError = createSelector(
  getRecordUiStateData,
  state => state.isGettingRemoteRecordsSummaryError || false,
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
  keySelectors.recordUuid,
  (recordsByUuid, recordUuid) => recordsByUuid[recordUuid] || false,
)((_state, recordUuid) => recordUuid);

const getRecordKey = createCachedSelector(
  nodesSelectors.getNodesByRecordUuid,
  surveyNodeDefsSelectors.getNodeDefRoot,
  surveyNodeDefsSelectors.getNodeDefsByUuid,
  getCategoryItemIndex,
  getTaxonIndex,
  (nodes, nodeDefRoot, nodeDefsByUuid, categoryItemIndex, taxonIndex) =>
    _getRecordKey(
      nodes,
      nodeDefRoot,
      nodeDefsByUuid,
      categoryItemIndex,
      taxonIndex,
    ),
)((_state, recordUuid) => recordUuid);

export default {
  getRemoteRecordsSummary: getRemoteRecordsSummaryState,
  getRemoteRecordSummary,
  isRemoteRecordsSummaryReady,
  getRemoteRecordsSummaryLastCheck,
  getIsGettingRemoteRecordsSummary,
  getIsGettingRemoteRecordsSummaryError,
  getRecordsByUuid: getRecordStateData,
  getRecords: _getAllRecordsList,
  getNumRecords,
  getRecordByUuid,
  getRecordKey,
};
