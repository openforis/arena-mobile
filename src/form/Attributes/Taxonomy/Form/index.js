import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {TouchableOpacity, View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import List from 'arena-mobile-ui/components/List';
import ChevronDown from 'form/Attributes/Code/Form/common/components/ChevronDown';
import SearchBar from 'form/Attributes/Code/Form/common/components/SearchBar';
import {useSearch} from 'form/Attributes/Code/Form/common/hooks/useSearch';
import BaseForm from 'form/Attributes/common/Base/Form';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const getTaxonItemLabel = ({item}) =>
  `(${item.props.code}) ${item.props.genus}`;

export const getTextForSearch = item => {
  const labels = Object.entries(item?.props?.labels || {}).map(
    ([_, label]) => label,
  );

  return [item?.props?.code, item.props.genus]
    .concat(labels)
    .join('.')
    .toLowerCase()
    .normalize('NFD');
};

const Form = ({node, nodeDef}) => {
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
  const {t} = useTranslation();

  const _labelStractor = useCallback(
    item => getTaxonItemLabel({item, language}),
    [language],
  );
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
        <TouchableOpacity
          onPress={handleSelect(item)}
          style={[styles.card, selected ? styles.selectedItem : {}]}>
          <Text style={selected ? styles.selectedItem : {}}>
            {getTaxonItemLabel({item})}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedItem, handleSelect],
  );

  const taxonomiesWithIndexToSearch = useMemo(() => {
    return itemsArray.map(item =>
      Object.assign({}, item, {textForSearch: getTextForSearch(item)}),
    );
  }, [itemsArray]);

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
      {!searching ? (
        <Button
          onPress={handleStartToSearch}
          type="secondary"
          iconPosition="right"
          label={
            selectedItem ? _labelStractor(selectedItem) : t('Form:select_empty')
          }
          icon={ChevronDown}
          customContainerStyle={[styles.select]}
          customTextStyle={[styles.text, selectedItem ? styles.selected : {}]}
          disabled={!applicable}
        />
      ) : (
        <SearchBar
          handleStopToSearch={handleStopToSearch}
          setSearchText={setSearchText}
        />
      )}

      <List
        data={itemsFiltered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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
