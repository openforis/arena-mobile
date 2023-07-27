import moment from 'moment-timezone';

import {Objects} from 'infra/objectUtils';

import {SORT_FUNCTIONS_BY_TYPE} from '../../components/Sorter/config';

const ACTIONS = {
  USE: 'USE',
  DOWNLOAD: 'DOWNLOAD',
  UPDATE: 'UPDATE',
  UNPUBLISHED: 'UNPUBLISHED',
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
  searchText,
}) => {
  let __surveys = [...localSurveys];
  const localSurveysByUuids = localSurveys.reduce((acc, survey) => {
    acc[survey.uuid] = survey;
    return acc;
  }, {});
  const localSurveysUuids = Object.keys(localSurveysByUuids);

  __surveys = populateLocalSurveys(localSurveys);

  if (surveysOrigin === 'remote' && surveys.length > 0) {
    for (const survey of surveys) {
      let listAction = ACTIONS.USE;
      if (localSurveysUuids.includes(survey.uuid)) {
        const localSurvey = localSurveysByUuids[survey.uuid];
        const isOutdated =
          moment(localSurvey.dateModified).diff(moment(survey.dateModified)) !==
          0;

        if (isOutdated && survey.published) {
          listAction = ACTIONS.UPDATE;
        }
        const surveyIndex = __surveys.findIndex(s => s.uuid === survey.uuid);
        __surveys[surveyIndex] = Object.assign(survey, {
          listAction,
          isInDevice: true,
        });
      } else {
        listAction = ACTIONS.DOWNLOAD;
        if (!survey.published) {
          listAction = ACTIONS.UNPUBLISHED;
        }
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

  if (searchText) {
    __surveys = __surveys.filter(survey => {
      const surveyName = survey.props.name?.toLowerCase() || '';
      const survyeLabel = (
        survey.props.labels?.[survey.props.languages?.[0]] || ''
      ).toLowerCase();

      const searchTextLower = searchText?.toLowerCase();

      return (
        surveyName.includes(searchTextLower) ||
        survyeLabel.includes(searchTextLower)
      );
    });
  }

  if (Objects.isEmpty(sortCriteria) || sortFunction === false) {
    return __surveys;
  }

  return __surveys.sort(sortFunction(sortCriteria));
};
