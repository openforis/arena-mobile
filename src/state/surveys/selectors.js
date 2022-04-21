import {createCachedSelector} from 're-reselect';
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

const getSurveyByUuid = createCachedSelector(
  getSurveys,
  (_, {surveyUuid = false} = {}) => ({surveyUuid}),
  (surveys, {surveyUuid}) => (surveyUuid ? surveys[surveyUuid] : {}),
)((_state_, {surveyUuid}) => surveyUuid || '__NO_KEY__');

export default {
  getSurveys,
  getSurveysAsList,
  getNumberOfLocalSurveys,
  getSurveyByUuid,
};
