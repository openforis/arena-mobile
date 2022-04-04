import {createActions} from 'redux-actions';

import types from './actionTypes';

const {survey} = createActions({
  [types.selectSurvey$]: ({surveyId}) => ({surveyId}),
  [types.unSelect$]: () => ({}),

  [types.SET_SURVEY]: ({survey: _survey}) => ({survey: _survey}),
  [types.SELECT_SURVEY_LANGUAGE]: ({selectedSurveyLanguage}) => ({
    selectedSurveyLanguage,
  }),
});

export default survey;
