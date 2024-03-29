import moment from 'moment-timezone';
import {handleActions} from 'redux-actions';

import {deleteValueByKey} from 'infra/objectUtils';
import globalActions from 'state/globalActions';
import surveyActions from 'state/survey/actionCreators';
import surveysActions from 'state/surveys/actionCreators';

import actions from '../actionCreators';
import initialState from '../initial.state';

const data = handleActions(
  {
    [actions.setRecord]: (
      state,
      {payload: {record = {}, isCreating = false}},
    ) => ({
      ...state,
      [record.uuid]: {
        ...record,
        dateModified: isCreating ? null : moment().toISOString(),
      },
    }),
    [actions.lockRecord]: (state, {payload: {recordUuid}}) => ({
      ...state,
      [recordUuid]: {
        ...state[recordUuid],
        locked: true,
      },
    }),
    [actions.unlockRecord]: (state, {payload: {recordUuid}}) => ({
      ...state,
      [recordUuid]: {
        ...state[recordUuid],
        locked: false,
      },
    }),
    [actions.cleanRecord]: (state, {payload: {recordUuid}}) => {
      let newState = {...state};
      delete newState[recordUuid];
      return newState;
    },
    [actions.cleanRecords]: (state, {payload: {recordUuids}}) => {
      let newState = {...state};
      recordUuids.forEach(recordUuid => {
        delete newState[recordUuid];
      });
      return newState;
    },
    [surveysActions.deleteSurvey]: (state, {payload: {surveyUuid}}) =>
      deleteValueByKey({
        conditionToDelete: item => item.surveyUuid === surveyUuid,
      })(state),

    [surveyActions.deleteSurveyData]: (state, {payload: {surveyUuid}}) =>
      deleteValueByKey({
        conditionToDelete: item => item.surveyUuid === surveyUuid,
      })(state),
    [globalActions.reset]: () => initialState.data || {},
  },
  initialState.data || {},
);

export default data;
