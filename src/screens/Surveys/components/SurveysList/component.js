import React, {useEffect, useMemo, useState} from 'react';
import {useSelector} from 'react-redux';

import Loading from 'arena-mobile-ui/components/List/Loading';
import SearchBar from 'form/Attributes/common/SearchableForm/SearchBar';
import {
  hooks as surveysHooks,
  selectors as surveysSelectors,
} from 'state/surveys';

import {SORTERS} from '../../components/Sorter/config';
import List from '../common/List';

import Empty from './Empty';
import Error from './Error';
import SubPanel from './SubPanel';
import {prepareSurveys} from './utils';

const ListEmptyComponent = ({
  errorRemoteServer,
  loading,
  surveysOrigin,
  setSurveysOrigin,
}) => {
  if (loading) {
    return <Loading />;
  }

  if (errorRemoteServer || surveysOrigin === 'remote') {
    return <Error />;
  }

  return (
    <Empty
      surveysOrigin={surveysOrigin}
      onPress={() => setSurveysOrigin('remote')}
    />
  );
};

const SurveysList = ({
  surveysOrigin = 'local',
  setSurveysOrigin,
  setSelectedSurvey,
}) => {
  const localSurveys = useSelector(surveysSelectors.getSurveysAsList);

  const [sortCriteriaIndex, setSortCriteriaIndex] = useState(0);
  const [searchText, setSearchText] = useState('');
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
        searchText,
      }),
    [surveysOrigin, localSurveys, surveys, sortCriteria, searchText],
  );

  return (
    <>
      <SearchBar setSearchText={setSearchText} autoFocus={false} />
      <List
        data={_surveys}
        surveysOrigin={surveysOrigin}
        setSelectedSurvey={setSelectedSurvey}
        ListEmptyComponent={
          <ListEmptyComponent
            surveysOrigin={surveysOrigin}
            setSurveysOrigin={setSurveysOrigin}
            loading={loading}
            errorRemoteServer={errorRemoteServer}
          />
        }
        errorRemoteServer={errorRemoteServer}
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
