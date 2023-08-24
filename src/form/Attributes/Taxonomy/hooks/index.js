import {NodeDefs} from '@openforis/arena-core';
import {useCallback, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {getTaxonItemLabel, getVernacularNameUuid} from 'arena/taxonomy';
import {selectors as appSelectors} from 'state/app';
import {selectors as surveySelectors} from 'state/survey';

export const useTaxonItemLabelExtractor = nodeDef => {
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const defaultVisibleFields = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
  );

  const _labelExtractor = useCallback(
    item => {
      return getTaxonItemLabel({
        item,
        language,
        taxonomyVisibleFields:
          NodeDefs.getVisibleFields?.(nodeDef) || defaultVisibleFields,
      });
    },
    [language, defaultVisibleFields, nodeDef],
  );

  return _labelExtractor;
};

export const useTaxonItemsWithSelected = ({node, nodeDef}) => {
  const items = useSelector(state =>
    surveySelectors.getTaxonomyItemsByTaxonomyUuid(
      state,
      nodeDef?.props?.taxonomyUuid,
    ),
  );

  const showOneOptionPerVernacularName = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesShowOneOptionPerVernacularName,
  );
  const defaultVisibleFields = useSelector(
    appSelectors.getSettingsPreferencesSurveyTaxonomiesDefaultVisibleFields,
  );

  const itemsArray = useMemo(() => {
    const _items = Object.values(items);
    if (
      showOneOptionPerVernacularName &&
      defaultVisibleFields.includes('vernacularNames')
    ) {
      return _items
        .map(item => {
          const vernacularNamesObj = item?.vernacularNames || {};
          const vernacularNamesItems = Object.values(vernacularNamesObj)
            .flat()
            .flatMap(vernacularNameItem => vernacularNameItem)
            .filter(value => !!value);

          if (vernacularNamesItems.length === 0) {
            return [item];
          }
          return vernacularNamesItems
            .map(vernacularNameItem => {
              const _item = Object.assign({}, item, {
                vernacularNames: {
                  [vernacularNameItem?.props?.lang]: [vernacularNameItem],
                },
              });
              return _item;
            })
            .flat();
        })
        .flat();
    }

    return _items;
  }, [items, showOneOptionPerVernacularName, defaultVisibleFields]);

  const selectedItem = useMemo(
    () =>
      itemsArray.find(
        item =>
          item.uuid === node?.value?.taxonUuid &&
          getVernacularNameUuid(item) === node?.value?.vernacularNameUuid,
      ),
    [itemsArray, node],
  );

  return {itemsArray, selectedItem};
};
