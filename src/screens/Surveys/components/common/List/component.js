import {Objects} from '@openforis/arena-core';
import moment from 'moment';
import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import CommonList from 'arena-mobile-ui/components/List';
import {selectors as surveySelectors} from 'state/survey';

import {SORTERS_DIRECTION, SORTERS_KEYS} from '../../Sorter/config';
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
    if (Objects.isEmpty(sortCriteria)) {
      return data;
    }

    if ([SORTERS_KEYS.dateModified].includes(sortCriteria?.type)) {
      return data.sort(
        (sa, sb) =>
          moment(sa.dateModified).diff(moment(sb.dateModified)) *
          (sortCriteria?.direction === SORTERS_DIRECTION.asc ? -1 : 1),
      );
    }
    if ([SORTERS_KEYS.name].includes(sortCriteria?.type)) {
      return data.sort(
        (sa, sb) =>
          (sa?.props?.name > sb?.props?.name ? -1 : 1) *
          (sortCriteria?.direction === SORTERS_DIRECTION.asc ? -1 : 1),
      );
    }
    return data;
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
