import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

const _normalize = items =>
  items.reduce(
    (acc, item) => Object.assign(acc, {[item.uuid]: Object.assign({}, item)}),
    {},
  );

const getState = state => state;
const getFilesState = createSelector(getState, state => state?.files || {});
const getFilesByUuid = createSelector(
  getFilesState,
  state => state?.data || {},
);

const getFiles = createSelector(getFilesByUuid, files => Object.values(files));

const getFileByUuid = createCachedSelector(
  getFilesByUuid,
  (_, nodeUuid) => nodeUuid,
  (filessByUuid, nodeUuid) => filessByUuid[nodeUuid] || false,
)((_state, nodeUuid) => nodeUuid);

const getFilesBySurveyUuid = createCachedSelector(
  getFiles,
  (_, surveyUuid) => surveyUuid,
  (files, surveyUuid) => files.filter(file => file.surveyUuid === surveyUuid),
)((_state, surveyUuid) => surveyUuid);

const getFilesByUuidSurveyUuid = createCachedSelector(
  getFilesBySurveyUuid,
  _normalize,
)((_state, recordUuid) => recordUuid);

const getFilesByRecordUuid = createCachedSelector(
  getFiles,
  (_, recordUuid) => recordUuid,
  (files, recordUuid) => files.filter(file => file.recordUuid === recordUuid),
)((_state, recordUuid) => recordUuid);

const getFilesByUuidRecordUuid = createCachedSelector(
  getFilesByRecordUuid,
  _normalize,
)((_state, recordUuid) => recordUuid);

const getFilesByNodeUuid = createCachedSelector(
  getFiles,
  (_, nodeUuid) => nodeUuid,
  (files, nodeUuid) => files.filter(file => file.nodeUuid === nodeUuid),
)((_state, nodeUuid) => nodeUuid);

const getFilesByUuidNodeUuid = createCachedSelector(
  getFilesByRecordUuid,
  _normalize,
)((_state, nodeUuid) => nodeUuid);

export default {
  getFiles,
  getFileByUuid,
  getFilesBySurveyUuid,
  getFilesByUuidSurveyUuid,

  getFilesByRecordUuid,
  getFilesByUuidRecordUuid,

  getFilesByNodeUuid,
  getFilesByUuidNodeUuid,
};
