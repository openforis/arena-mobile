import React from 'react';
import {useSelector} from 'react-redux';

import {selectors as surveysSelectors} from 'state/surveys';

import List from '../common/List';

import EmptyLocal from './Empty';

const Local = ({
  surveysOrigin = 'local',
  setSurveysOrigin,
  selectedSurvey,
  setSelectedSurvey,
}) => {
  const localSurveys = useSelector(surveysSelectors.getSurveysAsList);

  return (
    <List
      data={localSurveys}
      surveysOrigin={surveysOrigin}
      selectedSurvey={selectedSurvey}
      setSelectedSurvey={setSelectedSurvey}
      ListEmptyComponent={
        <EmptyLocal onPress={() => setSurveysOrigin('remote')} />
      }
    />
  );
};

export default Local;
