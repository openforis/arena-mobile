import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import nodesSelectors from 'state/nodes/selectors';
import recordsSelectors from 'state/records/selectors';

const getState = state => state;
const getSurveyState = createSelector(
  getState,
  state => state?.survey || false,
);
const getSurvey = createSelector(getSurveyState, state =>
  state?.data && state?.data.uuid ? state?.data : false,
);

const getUiState = createSelector(getSurveyState, state => state?.ui || {});

const getSelectedSurveyId = createSelector(getSurvey, survey => survey?.id);

const getSelectedSurveyUuid = createSelector(getSurvey, survey => survey?.uuid);

const getSelectedSurveyLanguage = createSelector(
  getUiState,
  ui => ui.selectedSurveyLanguage,
);

/*
SURVEY DATA
*/

const getName = createSelector(getSurvey, survey => survey.props.name);

const getLabels = createSelector(getSurvey, survey => survey.props.labels);

const getLabel = createSelector(
  getLabels,
  getSelectedSurveyLanguage,
  (labels, language) => labels[language],
);

const getSurveyData = createSelector(
  getName,
  getLabel,
  getSelectedSurveyLanguage,
  (name, label, language) => ({
    name,
    label,
    language,
  }),
);

// --- NodeDefs
const getNodeDefsByUuid = createSelector(getSurvey, survey => survey.nodeDefs);

const getNodeDefByUuid = createCachedSelector(
  getNodeDefsByUuid,
  (_, nodeDefUuid) => nodeDefUuid,
  (nodeDefsByUuid, nodeDefUuid) => nodeDefsByUuid[nodeDefUuid] || false,
)((_state_, nodeDefUuid) => nodeDefUuid);

const getNodeDefs = createSelector(getNodeDefsByUuid, nodeDefs =>
  Object.values(nodeDefs),
);
const getNodeDefRoot = createSelector(getNodeDefs, nodeDefs =>
  nodeDefs.find(({parentUuid}) => !parentUuid),
);

const getNodeDefChildren = createCachedSelector(
  getNodeDefs,
  (_, parentNodeDef) => parentNodeDef,
  (nodeDefs, parentNodeDef) =>
    nodeDefs.filter(
      ({parentUuid}) => !!parentUuid && parentUuid === parentNodeDef?.uuid,
    ),
)((_state_, parentNodeDef) => parentNodeDef?.uuid);

const getNodeDefEntityChildrenKeys = createSelector(
  getNodeDefChildren,
  childrenNodeDefs => childrenNodeDefs.filter(_nodeDef => _nodeDef.props.key),
);

const getNodeDefChildrenEntities = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.filter(({type}) => type === 'entity'),
)((_state_, parentNodeDef) => parentNodeDef?.uuid);

const getNodeDefEntityChildrenAttributes = createCachedSelector(
  getNodeDefChildren,
  nodeDefs => nodeDefs.filter(({type}) => type !== 'entity'),
)((_state_, parentNodeDef) => parentNodeDef?.uuid);

const getNodeDefEntityChildrenAttributesUuids = createCachedSelector(
  getNodeDefEntityChildrenAttributes,
  nodeDefs => nodeDefs.map(({uuid}) => uuid),
)((_state_, parentNodeDef) => parentNodeDef?.uuid);

const getNodeDefChildrenSingleEntities = createCachedSelector(
  getNodeDefChildren,
  nodeDefs =>
    nodeDefs.filter(
      ({type, props}) => type === 'entity' && props?.multiple !== true,
    ),
)((_state_, parentNodeDef) => parentNodeDef?.uuid);

// --- Records -> maybe move to the form

const getRecords = createCachedSelector(
  getSurvey,
  recordsSelectors.getRecords,
  (survey, records) =>
    records.filter(record => record.surveyUuid === survey?.uuid),
)(state => state?.survey?.data?.id || '__');

const getNumberRecords = createSelector(
  getRecords,
  records => (records || []).length,
);

// --- Nodes -> maybe move as above to the form

const getNodes = createSelector(
  getSurvey,
  nodesSelectors.getNodes,
  (survey, nodes) =>
    (nodes || []).filter(node => node.surveyUuid === survey?.uuid),
);

const getEntityNodeKeys = createCachedSelector(
  nodesSelectors.getNodes,
  getNodeDefsByUuid,
  (_, node) => node.uuid,
  (nodes, nodeDefsByUuid, nodeUuid) =>
    nodes.filter(
      n => n.parentUuid === nodeUuid && nodeDefsByUuid[n.nodeDefUuid].props.key,
    ),
)((_state_, node) => node.uuid);

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
};
