import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import CommonList from 'arena-mobile-ui/components/List';
import {selectors as surveySelectors} from 'state/survey';

import SurveyCard from '../SurveyCard';

const List = ({
  data,
  ListEmptyComponent,

  setSelectedSurvey,

  surveysOrigin,
}) => {
  const localSurvey = useSelector(surveySelectors.getSurvey);
  const keyExtractor = useCallback(item => `${item.id}`, []);

  const renderItem = useCallback(
    ({item}) => (
      <SurveyCard
        survey={item}
        onSelect={setSelectedSurvey}
        isLocalSurvey={localSurvey.uuid === item?.uuid}
        surveysOrigin={surveysOrigin}
      />
    ),
    [setSelectedSurvey, localSurvey, surveysOrigin],
  );

  return (
    <CommonList
      data={data}
      ListEmptyComponent={ListEmptyComponent}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

export default List;
