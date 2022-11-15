import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import ArenaList from 'arena-mobile-ui/components/List';
import surveySelectors from 'state/survey/selectors';

import {getTextForSearch} from '../../hooks/useSearch';

const List = ({categoryItems, renderItem, searchText, nodes}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const categoryItemsWithIndexToSearch = useMemo(() => {
    return categoryItems.map(item =>
      Object.assign({}, item, {
        textForSearch: getTextForSearch(item, language),
      }),
    );
  }, [categoryItems, language]);

  const categoryItemsFiltered = useMemo(() => {
    let searchTextNormalized = false;
    if (searchText) {
      searchTextNormalized = searchText.toLowerCase().normalize('NFD');
    }
    return categoryItemsWithIndexToSearch.filter(
      categoryItem =>
        (searchTextNormalized
          ? categoryItem?.textForSearch.includes(searchTextNormalized)
          : true) &&
        !nodes.some(node => node?.value?.itemUuid === categoryItem.uuid),
    );
  }, [categoryItemsWithIndexToSearch, searchText, nodes]);

  const keyExtractor = useCallback(item => item.uuid, []);

  return (
    <ArenaList
      data={categoryItemsFiltered}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  );
};

List.defaultProps = {
  searchText: false,
  nodes: [],
};
export default List;
