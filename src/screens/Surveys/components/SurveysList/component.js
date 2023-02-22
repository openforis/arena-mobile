import {Objects} from '@openforis/arena-core';
import moment from 'moment-timezone';
import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  hooks as surveysHooks,
  selectors as surveysSelectors,
} from 'state/surveys';

import {SORTERS, SORT_FUNCTIONS_BY_TYPE} from '../../components/Sorter/config';
import List from '../common/List';

import Empty from './Empty';
import SubPanel from './SubPanel';

const SurveysList = ({
  surveysOrigin = 'local',
  setSurveysOrigin,
  selectedSurvey,
  setSelectedSurvey,
}) => {
  const localSurveys = useSelector(surveysSelectors.getSurveysAsList);

  const [sortCriteriaIndex, setSortCriteriaIndex] = useState(0);
  const sortCriteria = useMemo(
    () => SORTERS[sortCriteriaIndex],
    [sortCriteriaIndex],
  );
  const {
    loading,
    error: errorRemoteServer,
    surveys = [],
    fetchSurveys,
  } = surveysHooks.useRemoteSurveys({prefetch: false});

  useEffect(() => {
    if (!loading && surveys.length <= 0) {
      setSelectedSurvey(null);
    }
  }, [loading, surveys, setSelectedSurvey]);

  useEffect(() => {
    if (surveysOrigin === 'remote') {
      fetchSurveys();
    }
  }, [surveysOrigin, fetchSurveys]);

  const _surveys = useMemo(() => {
    let __surveys = [...localSurveys];
    const localSurveysByUuids = localSurveys.reduce((acc, survey) => {
      acc[survey.uuid] = survey;
      return acc;
    }, {});
    const localSurveysUuids = Object.keys(localSurveysByUuids);

    __surveys = __surveys.map(survey =>
      Object.assign(survey, {listAction: 'USE', isInDevice: true}),
    );

    if (surveysOrigin === 'remote') {
      for (const survey of surveys) {
        let listAction = 'USE';
        if (localSurveysUuids.includes(survey.uuid)) {
          const localSurvey = localSurveysByUuids[survey.uuid];
          const isOutdated =
            moment(localSurvey.dateModified).diff(
              moment(survey.dateModified),
            ) !== 0;

          if (isOutdated) {
            listAction = 'UPDATE';
          }
          const surveyIndex = __surveys.findIndex(s => s.uuid === survey.uuid);
          __surveys[surveyIndex] = Object.assign(survey, {
            listAction,
            isInDevice: true,
          });
        } else {
          listAction = 'DOWNLOAD';
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
  }, [surveysOrigin, localSurveys, surveys, sortCriteria]);

  return (
    <>
      <List
        data={_surveys}
        surveysOrigin={surveysOrigin}
        selectedSurvey={selectedSurvey}
        setSelectedSurvey={setSelectedSurvey}
        showIcons={true}
        ListEmptyComponent={<Empty setSurveysOrigin={setSurveysOrigin} />}
      />
      {_surveys.length > 0 && (
        <SubPanel
          errorRemoteServer={errorRemoteServer}
          surveysOrigin={surveysOrigin}
          setSurveysOrigin={setSurveysOrigin}
          sortCriteriaIndex={sortCriteriaIndex}
          setSortCriteriaIndex={setSortCriteriaIndex}
        />
      )}
    </>
  );
};

export default SurveysList;
