import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import {
  hooks as surveysHooks,
  selectors as surveysSelectors,
} from 'state/surveys';

import {SORTERS} from '../../components/Sorter/config';
import List from '../common/List';

import Empty from './Empty';
import SubPanel from './SubPanel';
import {prepareSurveys} from './utils';

const SurveysList = ({
  surveysOrigin = 'local',
  setSurveysOrigin,
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

  const _surveys = useMemo(
    () =>
      prepareSurveys({
        surveysOrigin,
        localSurveys,
        surveys,
        sortCriteria,
      }),
    [surveysOrigin, localSurveys, surveys, sortCriteria],
  );

  return (
    <>
      <List
        data={_surveys}
        surveysOrigin={surveysOrigin}
        setSelectedSurvey={setSelectedSurvey}
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
