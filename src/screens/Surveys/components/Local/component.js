import React, {useCallback} from 'react';
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
  const handlePress = useCallback(
    () => setSurveysOrigin('remote'),
    [setSurveysOrigin],
  );

  return (
    <List
      data={localSurveys}
      surveysOrigin={surveysOrigin}
      selectedSurvey={selectedSurvey}
      setSelectedSurvey={setSelectedSurvey}
      ListEmptyComponent={<EmptyLocal onPress={handlePress} />}
    />
  );
};

export default Local;
