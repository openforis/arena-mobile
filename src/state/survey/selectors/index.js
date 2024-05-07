import {
  getSurvey,
  getSelectedSurveyId,
  getSelectedSurveyUuid,
  getSelectedSurveyName,
  getSelectedSurveyLanguage,
  getSelectedSurveyLanguages,
  getSurveyCycle,
  getSurveyCycles,
  getSelectedSurveyCycles,
  getSurveySRS,
  getSurveySRSIndex,
  getUiState,
  getCategoryItemIndex,
  getTaxonIndex,
} from './base';
import {
  getCategoryItems,
  getNumberOfCategoryItems,
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
  getSelectedSurveyName,
  getSelectedSurveyLanguage,
  getSelectedSurveyLanguages,
  getSurveyCycle,
  getSurveyCycles,
  getSelectedSurveyCycles,
  getSurveySRS,
  getSurveySRSIndex,

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
  getNumberOfCategoryItems,
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
