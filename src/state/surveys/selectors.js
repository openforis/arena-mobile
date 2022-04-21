import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

const getSurveys = state => state?.surveys?.data || {};

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
  (_, {surveyUuid}) => ({surveyUuid}),
  (surveys, {surveyUuid}) => surveys[surveyUuid] || {},
)((_state_, {surveyUuid}) => surveyUuid);

export default {
  getSurveys,
  getSurveysAsList,
  getNumberOfLocalSurveys,
  getSurveyByUuid,
};
