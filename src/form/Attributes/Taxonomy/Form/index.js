import {Taxa} from '@openforis/arena-core';
import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import {getVernacularNames, getVernacularNameUuid} from 'arena/taxonomy';
import Button from 'arena-mobile-ui/components/Button';
import List from 'arena-mobile-ui/components/List';
import {useSearch} from 'form/Attributes/Code/Form/common/hooks/useSearch';
import BaseForm from 'form/Attributes/common/Base/Form';
import Header from 'form/Attributes/common/SearchableForm/List/Header';
import ListItem from 'form/Attributes/common/SearchableForm/List/Item';
import {Objects} from 'infra/objectUtils';
import {selectors as formSelectors} from 'state/form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import {selectors as surveySelectors} from 'state/survey';

import {useTaxonItemLabelExtractor, useTaxonItemsWithSelected} from '../hooks';

import _styles from './styles';
import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

const getTextForSearch = (item, language) => {
  const vernacularNamesObj = item?.vernacularNames || {};

  const vernacularNames = Object.values(vernacularNamesObj)
    .flatMap(vernacularName => vernacularName)
    .map(vernacularName => vernacularName?.props?.name);

  const normalizedString = [
    item?.props?.code,
    item.props.genus,
    item.props.family,
    item.props.scientificName,
  ]
    .concat(vernacularNames || [])
    .join('.')
    .toLowerCase()
    .normalize('NFD');

  return normalizedString;
};

const generateKey = (item, textForSearch) => {
  const vernacularNames = getVernacularNames({item});
  const _textForSearch = textForSearch || item?.textForSearch || false;

  const _key = _textForSearch
    ? `${item.uuid}-${_textForSearch}-${Object.values(item?.vernacularNames)
        .flatMap(i => i)
        .map(i => i.uuid)}`
    : `${item.uuid}-${vernacularNames.join(',')}`;

  return _key;
};

const Form = ({node, nodeDef}) => {
  const styles = useThemedStyles(_styles);
  const {t} = useTranslation();
  const actions = useNodeFormActions({nodeDef});
  const {itemsArray, selectedItem} = useTaxonItemsWithSelected({node, nodeDef});

  const language = useSelector(surveySelectors.getSelectedSurveyLanguage);
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const handleCleanNode = useCallback(() => {
    actions.handleClean({node});
  }, [actions, node]);

  const handleSelect = useCallback(
    item => () => {
      const vernacularNameUuid = getVernacularNameUuid(item);

      const newValue = {taxonUuid: item?.uuid, vernacularNameUuid};

      if (node?.uuid) {
        actions.handleUpdate({node, value: newValue});
      } else {
        actions.handleCreate({value: newValue});
      }
    },
    [actions, node],
  );

  const _labelExtractor = useTaxonItemLabelExtractor(nodeDef);

  const {
    searchText,
    searching,
    setSearchText,
    handleStartToSearch,
    handleStopToSearch,
  } = useSearch();

  const keyExtractor = useCallback(item => {
    return item?.keyIndex;
  }, []);

  const renderItem = useCallback(
    ({item}) => {
      const selected =
        selectedItem?.uuid === item.uuid &&
        getVernacularNameUuid(selectedItem) === getVernacularNameUuid(item);

      return (
        <ListItem
          label={_labelExtractor(item)}
          handlePress={handleSelect(item)}
          selected={selected}
        />
      );
    },
    [selectedItem, _labelExtractor, handleSelect],
  );

  const taxonomiesWithIndexToSearch = useMemo(() => {
    return itemsArray.map(item => {
      const textForSearch = getTextForSearch(item, language);
      return {
        ...item,
        textForSearch,
        keyIndex: generateKey(item, textForSearch),
      };
    });
  }, [itemsArray, language]);

  const itemsFiltered = useMemo(() => {
    let searchTextNormalized = false;
    if (searchText) {
      searchTextNormalized = searchText.toLowerCase().normalize('NFD');
      const _items = taxonomiesWithIndexToSearch.filter(_item =>
        searchTextNormalized
          .split(' ')
          .every(searchTextNormalizedItem =>
            _item?.textForSearch.includes(searchTextNormalizedItem),
          ),
      );

      if (_items.length > 0) {
        return _items;
      }
      return taxonomiesWithIndexToSearch.filter(_item => {
        return ['UNK', 'UNL'].includes(Taxa.getCode(_item));
      });
    }
    return taxonomiesWithIndexToSearch;
  }, [taxonomiesWithIndexToSearch, searchText]);

  return (
    <View style={styles.container}>
      <Header
        searching={searching}
        handleStartToSearch={handleStartToSearch}
        selectedItem={selectedItem}
        _labelExtractor={_labelExtractor}
        applicable={applicable}
        handleStopToSearch={handleStopToSearch}
        setSearchText={setSearchText}
        placeholderButton={t('Form:select_empty_type_to_search')}
      />

      {!Objects.isEmpty(node?.value?.taxonUuid) && (
        <Button
          onPress={handleCleanNode}
          type="ghostBlack"
          label={t('Form:clean')}
          customTextStyle={styles.buttonText}
        />
      )}

      <List
        data={itemsFiltered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

Form.defaultProps = {
  node: null,
  nodeDef: null,
};

const TaxonForm = ({nodeDef}) => {
  const node = useSelector(formSelectors.getNode);

  const nodes = useMemo(() => [node], [node]);

  return (
    <BaseForm nodeDef={nodeDef} hasSubmitButton={false} nodes={nodes}>
      <Form nodeDef={nodeDef} node={node} />
    </BaseForm>
  );
};

export default TaxonForm;
