import React, {useCallback} from 'react';

import CommonList from 'arena-mobile-ui/components/List';

import SurveyCard from '../SurveyCard';
const List = ({
  data,
  ListEmptyComponent,
  selectedSurvey,
  setSelectedSurvey,
}) => {
  const keyExtractor = useCallback(item => `${item.info.id}`, []);

  const renderItem = useCallback(
    ({item}) => (
      <SurveyCard
        survey={item}
        onSelect={setSelectedSurvey}
        isSelected={selectedSurvey?.info?.uuid === item?.info?.uuid}
      />
    ),
    [selectedSurvey, setSelectedSurvey],
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
