import {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyLanguage,
  getSelectedSurveyLanguages,
  getSurveyCycle,
  getSurveySRS,
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
  getNodeDefEntityChildrenAttributesUuids,
} from './nodeDefs';
import {getNodes, getEntityNodeKeys, getEntityNodeKeysAsString} from './nodes';
import {getRecords, getNumberRecords} from './records';
import {getSurveyData} from './surveyData';
import {
  getTaxonomyItemsUuidsByTaxonomyUuid,
  getTaxonomyItemsByTaxonomyUuid,
  getTaxonomyItemByUuid,
} from './taxonomies';
import {getIsUploading, getUploadProgress, getJob} from './ui';

export default {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyLanguage,
  getSelectedSurveyLanguages,
  getSurveyCycle,
  getSurveySRS,

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
  getNodeDefEntityChildrenAttributesUuids,

  // ---- category
  getCategoryItems,
  getCategoryItemByUuid,
  getNodeCategoryItems,
  getParentCodeNode,

  // ---- Taxonomies
  getTaxonomyItemsUuidsByTaxonomyUuid,
  getTaxonomyItemsByTaxonomyUuid,
  getTaxonomyItemByUuid,

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
  getJob,
};
