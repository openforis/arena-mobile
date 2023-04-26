import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import List from 'arena-mobile-ui/components/List';
import {useSearch} from 'form/Attributes/Code/Form/common/hooks/useSearch';
import BaseForm from 'form/Attributes/common/Base/Form';
import Header from 'form/Attributes/common/SearchableForm/List/Header';
import ListItem from 'form/Attributes/common/SearchableForm/List/Item';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import {selectors as surveySelectors} from 'state/survey';

import {useTaxonItemLabelExtractor} from '../hooks';

import styles from './styles';

const getTextForSearch = (item, language) => {
  const vernacularNamesObj = item?.vernacularNames || {};
  const vernacularNames = Object.values(vernacularNamesObj).flatMap(
    vernacularName => vernacularName?.props?.name,
  );

  return [
    item?.props?.code,
    item.props.genus,
    item.props.family,
    item.props.scientificName,
  ]
    .concat(vernacularNames || [])
    .join('.')
    .toLowerCase()
    .normalize('NFD');
};

const Form = ({node, nodeDef}) => {
  const {t} = useTranslation();
  const actions = useNodeFormActions({nodeDef});

  const items = useSelector(state =>
    surveySelectors.getTaxonomyItemsByTaxonomyUuid(
      state,
      nodeDef?.props?.taxonomyUuid,
    ),
  );
  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const handleSelect = useCallback(
    item => () => {
      let newValue = {taxonUuid: item?.uuid};
      if (node?.uuid) {
        actions.handleUpdate({node, value: newValue});
      } else {
        actions.handleCreate({value: newValue});
      }
    },
    [actions, node],
  );

  const _labelStractor = useTaxonItemLabelExtractor(nodeDef);

  const itemsArray = useMemo(() => Object.values(items), [items]);

  const selectedItem = useMemo(
    () => itemsArray.find(item => item.uuid === node?.value?.taxonUuid),
    [itemsArray, node],
  );

  const {
    searchText,
    searching,
    setSearchText,
    handleStartToSearch,
    handleStopToSearch,
  } = useSearch();

  const keyExtractor = useCallback(item => item.uuid, []);

  const renderItem = useCallback(
    ({item}) => {
      const selected = selectedItem?.uuid === item.uuid;

      return (
        <ListItem
          label={_labelStractor(item)}
          handlePress={handleSelect(item)}
          selected={selected}
        />
      );
    },
    [selectedItem, _labelStractor, handleSelect],
  );

  const taxonomiesWithIndexToSearch = useMemo(() => {
    return itemsArray.map(item =>
      Object.assign({}, item, {
        textForSearch: getTextForSearch(item, language),
      }),
    );
  }, [itemsArray, language]);

  const itemsFiltered = useMemo(() => {
    let searchTextNormalized = false;
    if (searchText) {
      searchTextNormalized = searchText.toLowerCase().normalize('NFD');
      return taxonomiesWithIndexToSearch.filter(_item =>
        _item?.textForSearch.includes(searchTextNormalized),
      );
    }
    return taxonomiesWithIndexToSearch;
  }, [taxonomiesWithIndexToSearch, searchText]);

  return (
    <View style={styles.container}>
      <Header
        searching={searching}
        handleStartToSearch={handleStartToSearch}
        selectedItem={selectedItem}
        _labelStractor={_labelStractor}
        applicable={applicable}
        handleStopToSearch={handleStopToSearch}
        setSearchText={setSearchText}
        placeholderButton={t('Form:select_empty_type_to_search')}
      />

      <List
        data={itemsFiltered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

const TaxonForm = ({nodeDef}) => {
  const node = useSelector(formSelectors.getNode);

  return (
    <BaseForm nodeDef={nodeDef} hasSubmitButton={false}>
      <Form nodeDef={nodeDef} node={node} />
    </BaseForm>
  );
};

export default TaxonForm;
