import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import CommonList from 'arena-mobile-ui/components/List';
import {selectors as surveySelectors} from 'state/survey';

import SurveyCard from '../SurveyCard';
const List = ({
  data,
  ListEmptyComponent,
  selectedSurvey,
  setSelectedSurvey,
  showIcons = false,
}) => {
  const localSurvey = useSelector(surveySelectors.getSurvey);
  const keyExtractor = useCallback(item => `${item.id}`, []);

  const renderItem = useCallback(
    ({item}) => (
      <SurveyCard
        survey={item}
        onSelect={setSelectedSurvey}
        isSelected={selectedSurvey?.uuid === item?.uuid}
        isLocalSurvey={localSurvey.uuid === item?.uuid}
        showIcons={showIcons}
      />
    ),
    [showIcons, selectedSurvey, setSelectedSurvey, localSurvey],
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
