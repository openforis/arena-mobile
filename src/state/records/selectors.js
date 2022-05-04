import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

const getState = state => state;
const getRecordsState = createSelector(getState, state => state?.records || {});
const getRecordStateData = createSelector(
  getRecordsState,
  state => state?.data || {},
);

const _getAllRecordsList = createSelector(getRecordStateData, records =>
  Object.values(records),
);

const getRecordByUuid = createCachedSelector(
  getRecordStateData,
  (_, recordUuid) => recordUuid,
  (recordsByUuid, recordUuid) => recordsByUuid[recordUuid] || false,
)((_state, recordUuid) => recordUuid);

export default {
  getRecordsByUuid: getRecordStateData,
  getRecords: _getAllRecordsList,
  getRecordByUuid,
};
