import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

const getSurveys = state => state?.surveys?.data || {};
const getUi = state => state?.surveys?.ui || {};

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
)((_state_, {surveyUuid}) => surveyUuid || '_');

const getIsLoading = createSelector(getUi, ui => ui?.isLoading || false);

export default {
  getSurveys,
  getSurveysAsList,
  getNumberOfLocalSurveys,
  getSurveyByUuid,
  getIsLoading,
};
