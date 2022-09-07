import moment from 'moment-timezone';
import {createCachedSelector} from 're-reselect';
import {createSelector} from 'reselect';

const getSurveys = state => state?.surveys?.data || {};
const getUi = state => state?.surveys?.ui || {};

const getSurveysAsList = createSelector(getSurveys, surveys =>
  (Object.values(surveys) || []).sort((surveyA, surveyB) =>
    moment(surveyA.dateModified) > moment(surveyB.dateModified) ? -1 : 1,
  ),
);

const getNumberOfLocalSurveys = createSelector(
  getSurveysAsList,
  surveys => surveys.length,
);

const getSurveyByUuid = createCachedSelector(
  getSurveys,
  (_, surveyUuid) => surveyUuid,
  (surveys, surveyUuid) => surveys[surveyUuid] || {},
)((_state_, surveyUuid) => surveyUuid || '_');

const getSurveyById = createCachedSelector(
  getSurveysAsList,
  (_, surveyId) => surveyId,
  (surveys, surveyId) => surveys.find(survey => survey.id === surveyId) || [],
)((_state_, surveyId) => surveyId || '_');

const getIsLoading = createSelector(getUi, ui => ui?.isLoading || false);

export default {
  getSurveys,
  getSurveysAsList,
  getNumberOfLocalSurveys,
  getSurveyByUuid,
  getSurveyById,
  getIsLoading,
};
