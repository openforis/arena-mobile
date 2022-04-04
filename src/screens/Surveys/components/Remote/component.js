import React from 'react';

import {hooks as surveysHooks} from 'state/surveys';

import List from '../common/List';
import Loading from '../common/Loading';

import EmptyRemote from './Empty';
import ErrorRemote from './Error';

const Remote = ({
  surveysOrigin = 'remote',
  setSurveysOrigin,
  selectedSurvey,
  setSelectedSurvey,
}) => {
  const {loading, error, surveys = []} = surveysHooks.useRemoteSurveys();

  return (
    <List
      data={surveys}
      surveysOrigin={surveysOrigin}
      selectedSurvey={selectedSurvey}
      setSelectedSurvey={setSelectedSurvey}
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
