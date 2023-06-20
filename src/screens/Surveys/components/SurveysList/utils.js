import moment from 'moment-timezone';

import {Objects} from 'infra/objectUtils';

import {SORT_FUNCTIONS_BY_TYPE} from '../../components/Sorter/config';

const ACTIONS = {
  USE: 'USE',
  DOWNLOAD: 'DOWNLOAD',
  UPDATE: 'UPDATE',
};

const populateLocalSurveys = localSurveys => {
  return localSurveys.map(survey =>
    Object.assign(survey, {listAction: ACTIONS.USE, isInDevice: true}),
  );
};

export const prepareSurveys = ({
  surveysOrigin,
  localSurveys,
  surveys,
  sortCriteria,
}) => {
  let __surveys = [...localSurveys];
  const localSurveysByUuids = localSurveys.reduce((acc, survey) => {
    acc[survey.uuid] = survey;
    return acc;
  }, {});
  const localSurveysUuids = Object.keys(localSurveysByUuids);

  __surveys = populateLocalSurveys(localSurveys);

  if (surveysOrigin === 'remote') {
    for (const survey of surveys) {
      let listAction = ACTIONS.USE;
      if (localSurveysUuids.includes(survey.uuid)) {
        const localSurvey = localSurveysByUuids[survey.uuid];
        const isOutdated =
          moment(localSurvey.dateModified).diff(moment(survey.dateModified)) !==
          0;

        if (isOutdated) {
          listAction = ACTIONS.UPDATE;
        }
        const surveyIndex = __surveys.findIndex(s => s.uuid === survey.uuid);
        __surveys[surveyIndex] = Object.assign(survey, {
          listAction,
          isInDevice: true,
        });
      } else {
        listAction = ACTIONS.DOWNLOAD;
        __surveys.push(
          Object.assign(survey, {
            listAction,

            isInDevice: false,
          }),
        );
      }
    }
  }

  const sortFunction = SORT_FUNCTIONS_BY_TYPE[sortCriteria?.type] || false;

  if (Objects.isEmpty(sortCriteria) || sortFunction === false) {
    return __surveys;
  }

  return __surveys.sort(sortFunction(sortCriteria));
};
