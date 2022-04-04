import {createSelector} from 'reselect';

const getState = state => state?.surveys || {};
const getSurveys = createSelector(getState, state => state?.data || {});

const getSurveysAsList = createSelector(
  getSurveys,
  surveys => Object.values(surveys) || [],
);

const getNumberOfLocalSurveys = createSelector(
  getSurveysAsList,
  surveys => surveys.length,
);

const getSurveysIds = createSelector(getSurveys, surveys =>
  Object.keys(surveys),
);

const getSurveyById = createSelector(
  getSurveys,
  (_, {surveyId = false} = {}) => ({surveyId}),
  (surveys, {surveyId}) => (surveyId ? surveys[surveyId] : {}),
);

export default {
  getSurveys,
  getSurveysAsList,
  getNumberOfLocalSurveys,
  getSurveysIds,
  getSurveyById,
};
