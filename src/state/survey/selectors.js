import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

import nodesSelectors from 'state/nodes/selectors';
import recordsSelectors from 'state/records/selectors';

const getState = state => state;
const getSurveyState = createSelector(
  getState,
  state => state?.survey || false,
);
const getSurveyStateData = createSelector(getSurveyState, state =>
  state?.data && Object.values(state?.data).length > 0 ? state?.data : false,
);

const getUiState = createSelector(getSurveyState, state => state?.ui || {});

const getSelectedSurveyId = createSelector(
  getSurveyStateData,
  survey => survey?.info?.id,
);

const getSelectedSurveyUuid = createSelector(
  getSurveyStateData,
  survey => survey?.info?.uuid,
);

const getSurvey = getSurveyStateData;

const getSelectedSurveyLanguage = createSelector(
  getUiState,
  ui => ui.selectedSurveyLanguage,
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
    records.filter(record => record.surveyUuid === survey.info.uuid),
)(state => state?.survey?.data?.info?.id || '__');

const getNumberRecords = createSelector(
  getRecords,
  records => (records || []).length,
);

// --- Nodes -> maybe move as above to the form

const getNodes = createSelector(
  getSurvey,
  nodesSelectors.getNodes,
  (survey, nodes) =>
    (nodes || []).filter(node => node.surveyUuid === survey.info.uuid),
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

  // --- NodeDefs
  getNodeDefs,
  getNodeDefsByUuid,
  getNodeDefByUuid,
  getNodeDefRoot,
  getNodeDefChildren,
  getNodeDefEntityChildrenKeys,
  getNodeDefChildrenEntities,
  getNodeDefChildrenSingleEntities,

  // --- Records
  getRecords,
  getNumberRecords,

  // --- Nodes
  getNodes,
  getEntityNodeKeys,
};
