import React, {useEffect} from 'react';

import Loading from 'arena-mobile-ui/components/List/Loading';
import {hooks as surveysHooks} from 'state/surveys';

import List from '../common/List';

import EmptyRemote from './Empty';
import ErrorRemote from './Error';

const Remote = ({
  surveysOrigin = 'remote',
  setSurveysOrigin,
  selectedSurvey,
  setSelectedSurvey,
}) => {
  const {loading, error, surveys = []} = surveysHooks.useRemoteSurveys();

  useEffect(() => {
    if (!loading && surveys.length <= 0) {
      setSelectedSurvey(null);
    }
  }, [loading, surveys, setSelectedSurvey]);

  return (
    <List
      data={surveys}
      surveysOrigin={surveysOrigin}
      selectedSurvey={selectedSurvey}
      setSelectedSurvey={setSelectedSurvey}
      showIcons={true}
      ListEmptyComponent={
        loading ? (
          <Loading />
        ) : error ? (
          <ErrorRemote />
        ) : (
          <EmptyRemote setSurveysOrigin={setSurveysOrigin} />
        )
      }
    />
  );
};

export default Remote;
