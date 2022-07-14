import {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyLanguage,
  getSelectedSurveyLanguages,
  getUiState,
} from './base';
import {
  getCategoryItems,
  getCategoryItemByUuid,
  getNodeCategoryItems,
  getParentCodeNode,
} from './categories';
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
  getSelectedSurveyLanguages,

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

  // ---- category
  getCategoryItems,
  getCategoryItemByUuid,
  getNodeCategoryItems,
  getParentCodeNode,

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
