import {handleActions} from 'redux-actions';

import {deleteValueByKey, mergeNoSpread} from 'infra/objectUtils';
import filesActions from 'state/files/actionCreators';
import globalActions from 'state/globalActions';
import recordsActions from 'state/records/actionCreators';
import surveyActions from 'state/survey/actionCreators';
import surveysActions from 'state/surveys/actionCreators';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setNode]: (state, {payload: {node}}) => ({
      ...state,
      [node.uuid]: node,
    }),
    [filesActions.setFiles]: (state, {payload: {filesByUuid = {}}}) => {
      const newNodes = {};
      Object.values(filesByUuid).forEach(file => {
        const currentNode = Object.assign({}, state[file.nodeUuid]);
        newNodes[file.nodeUuid] = Object.assign({}, currentNode, {
          value: Object.assign({}, currentNode.value, {
            uri: file.uri,
            path: file.uri,
          }),
        });
      });

      return {
        ...state,
        ...newNodes,
      };
    },

    [actions.setNodes]: (state, {payload: {nodes}}) =>
      mergeNoSpread(state, nodes),
    [actions.deleteNode]: (state, {payload: {node}}) => {
      let newState = {...state};
      delete newState[node.uuid];
      return newState;
    },
    [actions.deleteNodes]: (state, {payload: {nodes = []}}) => {
      const newNodes = Object.assign({}, state);

      nodes.forEach(({uuid: nodeUuid}) => {
        delete newNodes[nodeUuid];
      });

      return newNodes;
    },
    [actions.clean]: () => initialState.data || {},
    [surveysActions.deleteSurvey]: (state, {payload: {surveyUuid}}) =>
      deleteValueByKey({
        conditionToDelete: item => item.surveyUuid === surveyUuid,
      })(state),
    [surveyActions.deleteSurveyData]: (state, {payload: {surveyUuid}}) =>
      deleteValueByKey({
        conditionToDelete: item => item.surveyUuid === surveyUuid,
      })(state),

    [recordsActions.cleanRecord]: (state, {payload: {recordUuid}}) =>
      deleteValueByKey({
        conditionToDelete: item => item.recordUuid === recordUuid,
      })(state),
    [recordsActions.cleanRecords]: (state, {payload: {recordUuids}}) =>
      deleteValueByKey({
        conditionToDelete: item => recordUuids.includes(item.recordUuid),
      })(state),
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
