import React, {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import ArenaList from 'arena-mobile-ui/components/List';
import {getTextForSearch} from 'form/Attributes/Code/Form/common/hooks/useSearch';
import surveySelectors from 'state/survey/selectors';

const List = ({categoryItems, renderItem, searchText, nodes}) => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const categoryItemsWithIndexToSearch = useMemo(
    () =>
      categoryItems.map(item => ({
        ...item,
        textForSearch: getTextForSearch(item, language),
      })),
    [categoryItems, language],
  );

  const categoryItemsUuidsFiltered = useMemo(() => {
    let searchTextNormalized = false;
    if (searchText) {
      searchTextNormalized = searchText.toLowerCase().normalize('NFD');
    }

    const _categoryItemsUuidsFiltered = categoryItemsWithIndexToSearch
      .filter(
        categoryItem =>
          searchTextNormalized
            ? categoryItem?.textForSearch.includes(searchTextNormalized)
            : true,
        /*DONT_SHOW_SELECTED !nodes.some(node => node?.value?.itemUuid === categoryItem.uuid) */
      )
      .map(categoryItem => categoryItem.uuid);

    return _categoryItemsUuidsFiltered;
  }, [categoryItemsWithIndexToSearch, searchText]);

  const keyExtractor = useCallback(itemUuid => itemUuid, []);

  return (
    <ArenaList
      data={categoryItemsUuidsFiltered}
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
