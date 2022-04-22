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

export default {
  getRecordsByUuid: getRecordStateData,
  getRecords: _getAllRecordsList,
};
