import {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyLanguage,
  getUiState,
} from './base';
import {
  getNodeDefs,
  getNodeDefsByUuid,
  getNodeDefByUuid,
  getNodeDefRoot,
  getNodeDefChildren,
  getNodeDefEntityChildrenKeys,
  getNodeDefChildrenEntities,
  getNodeDefChildrenSingleEntities,
  getNodeDefEntityChildrenAttributes,
  getNodeDefEntityChildrenAttributesUuids,
} from './nodeDefs';
import {getNodes, getEntityNodeKeys, getEntityNodeKeysAsString} from './nodes';
import {getRecords, getNumberRecords} from './records';
import {getSurveyData} from './surveyData';
import {getIsUploading, getUploadProgress} from './ui';

export default {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyLanguage,

  // --- survey
  getSurveyData,

  // --- NodeDefs
  getNodeDefs,
  getNodeDefsByUuid,
  getNodeDefByUuid,
  getNodeDefRoot,
  getNodeDefChildren,
  getNodeDefEntityChildrenKeys,
  getNodeDefChildrenEntities,
  getNodeDefChildrenSingleEntities,
  getNodeDefEntityChildrenAttributes,
  getNodeDefEntityChildrenAttributesUuids,

  // --- Records
  getRecords,
  getNumberRecords,

  // --- Nodes
  getNodes,
  getEntityNodeKeys,
  getEntityNodeKeysAsString,

  // --- UI
  getUiState,
  getIsUploading,
  getUploadProgress,
};
