import {handleActions} from 'redux-actions';

import {deleteValueByKey} from 'infra/objectUtils';
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
    [actions.setNodes]: (state, {payload: {nodes}}) => {
      let nodesToInsertByUuid = {};
      nodes.forEach(node => {
        nodesToInsertByUuid[node.uuid] = {...node};
      });
      return {
        ...state,
        ...nodesToInsertByUuid,
      };
    },
    [actions.deleteNode]: (state, {payload: {node}}) => {
      let newState = {...state};
      delete newState[node.uuid];
      return newState;
    },
    [actions.clean]: () => initialState.data,
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
  },
  initialState.data || {},
);

export default data;
