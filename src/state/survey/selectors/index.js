import {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyLanguage,
  getSelectedSurveyLanguages,
  getSurveyCycle,
  getSurveyCycles,
  getSelectedSurveyCycles,
  getSurveySRS,
  getUiState,
  getCategoryItemIndex,
  getTaxonIndex,
} from './base';
import {
  getCategoryItems,
  getCategoryItemByUuid,
  getNodeCategoryItems,
} from './categories';
import {
  getNodeDefs,
  getNodeDefsByUuid,
  getNodeDefByUuid,
  getNodeDefRoot,
  getEntitiesNodeDefsUuids,
  getNodeDefChildren,
  getNodeDefEntityChildrenKeys,
  getNodeDefTableChildrenUuid,
} from './nodeDefs';
import {
  getNodes,
  getEntityNodeKeys,
  getEntityNodeKeysAsString,
  getEntityNodeKeysAsStringWithLabel,
} from './nodes';
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
  getSurveyCycles,
  getSelectedSurveyCycles,
  getSurveySRS,

  // --- survey
  getSurveyData,

  // --- NodeDefs
  getNodeDefs,
  getNodeDefsByUuid,
  getNodeDefByUuid,
  getEntitiesNodeDefsUuids,
  getNodeDefRoot,
  getNodeDefChildren,
  getNodeDefEntityChildrenKeys,

  getNodeDefTableChildrenUuid,

  // ---- category
  getCategoryItems,
  getCategoryItemByUuid,
  getNodeCategoryItems,
  getCategoryItemIndex,

  // ---- Taxonomies
  getTaxonomyItemsUuidsByTaxonomyUuid,
  getTaxonomyItemsByTaxonomyUuid,
  getTaxonomyItemByUuid,
  getTaxonIndex,

  // --- Records
  getRecords,
  getNumberRecords,

  // --- Nodes
  getNodes,
  getEntityNodeKeys,
  getEntityNodeKeysAsString,
  getEntityNodeKeysAsStringWithLabel,

  // --- UI
  getUiState,
  getIsUploading,
  getUploadProgress,
  getJob,
};
