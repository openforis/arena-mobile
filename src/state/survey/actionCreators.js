import {createActions} from 'redux-actions';

import types from './actionTypes';

const {survey} = createActions({
  [types.selectSurvey$]: ({surveyUuid}) => ({surveyUuid}),
  [types.deleteSurveyData$]: ({surveyUuid = false} = {}) => ({surveyUuid}),
  [types.uploadSurveyData$]: () => ({}),
  [types.SET_SURVEY]: ({survey: _survey}) => ({survey: _survey}),
  [types.CLEAN_SURVEY]: () => ({}),
  [types.SELECT_SURVEY_LANGUAGE]: ({selectedSurveyLanguage}) => ({
    selectedSurveyLanguage,
  }),
});

export default survey;
