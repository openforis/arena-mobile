import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import {keySelectors, normalizeByUuid} from 'infra/stateUtils';

const getState = state => state;
const getFilesState = createSelector(getState, state => state?.files || {});
const getFilesByUuid = createSelector(
  getFilesState,
  state => state?.data || {},
);

const getFiles = createSelector(getFilesByUuid, files => Object.values(files));

const getNumFiles = createSelector(getFiles, files => files.length);

const getFileByUuid = createCachedSelector(
  getFilesByUuid,
  (_, nodeUuid) => nodeUuid,
  (filesByUuid, nodeUuid) => filesByUuid[nodeUuid] || false,
)(keySelectors.nodeUuid);

const getFilesBySurveyUuid = createCachedSelector(
  getFiles,
  (_, surveyUuid) => surveyUuid,
  (files, surveyUuid) => files.filter(file => file.surveyUuid === surveyUuid),
)(keySelectors.surveyUuid);

const getFilesByUuidSurveyUuid = createCachedSelector(
  getFilesBySurveyUuid,
  normalizeByUuid,
)(keySelectors.recordUuid);

const getFilesByRecordUuid = createCachedSelector(
  getFiles,
  keySelectors.recordUuid,
  (files, recordUuid) => files.filter(file => file.recordUuid === recordUuid),
)(keySelectors.recordUuid);

const getFilesByUuidRecordUuid = createCachedSelector(
  getFilesByRecordUuid,
  normalizeByUuid,
)(keySelectors.recordUuid);

const getFilesByNodeUuid = createCachedSelector(
  getFiles,
  (_, nodeUuid) => nodeUuid,
  (files, nodeUuid) => files.filter(file => file.nodeUuid === nodeUuid),
)(keySelectors.nodeUuid);

const getFilesByUuidNodeUuid = createCachedSelector(
  getFilesByRecordUuid,
  normalizeByUuid,
)(keySelectors.nodeUuid);

export default {
  getFiles,
  getNumFiles,
  getFileByUuid,
  getFilesBySurveyUuid,
  getFilesByUuidSurveyUuid,

  getFilesByRecordUuid,
  getFilesByUuidRecordUuid,

  getFilesByNodeUuid,
  getFilesByUuidNodeUuid,
};
