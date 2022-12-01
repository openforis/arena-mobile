import {Objects} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import CommonList from 'arena-mobile-ui/components/List';
import {selectors as surveySelectors} from 'state/survey';

import {SORT_FUNCTIONS_BY_TYPE} from '../../Sorter/config';
import SurveyCard from '../SurveyCard';

const List = ({
  data,
  ListEmptyComponent,
  selectedSurvey,
  setSelectedSurvey,
  showIcons = false,
  sortCriteria,
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

  const dataSorted = useMemo(() => {
    const sortFunction = SORT_FUNCTIONS_BY_TYPE[sortCriteria?.type];

    if (Objects.isEmpty(sortCriteria) || Objects.isEmpty(sortFunction)) {
      return data;
    }

    return data.sort(sortFunction(sortCriteria));
  }, [data, sortCriteria]);

  return (
    <CommonList
      data={dataSorted}
      ListEmptyComponent={ListEmptyComponent}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

export default List;
