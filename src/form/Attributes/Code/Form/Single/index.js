import React, {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {useCode} from '../../Preview/hooks';
import ChevronDown from '../common/components/ChevronDown';
import List from '../common/components/List';
import SearchBar from '../common/components/SearchBar';
import {useSearch} from '../common/hooks/useSearch';

import styles from './styles';

const FormCodeSingle = ({nodeDef, node}) => {
  const {t} = useTranslation();

  const {categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });
  const {
    searchText,
    searching,
    setSearchText,
    handleStartToSearch,
    handleStopToSearch,
  } = useSearch();

  const {handleUpdate, handleCreate} = useNodeFormActions({nodeDef});

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const selectedItem = useMemo(
    () => categoryItems.find(item => item.uuid === node?.value?.itemUuid),
    [categoryItems, node],
  );

  const handleSelect = useCallback(
    categoryItem => e => {
      e.stopPropagation();
      const newValue = {itemUuid: categoryItem?.uuid};
      if (node?.uuid) {
        handleUpdate({node, value: newValue});
      } else {
        handleCreate({value: newValue});
      }
    },
    [handleUpdate, handleCreate, node],
  );

  const _labelStractor = useCallback(
    item => getCategoryItemLabel(item),
    [getCategoryItemLabel],
  );

  const renderItem = useCallback(
    ({item}) => {
      const selected = selectedItem?.uuid === item.uuid;
      return (
        <TouchableOpacity
          onPress={handleSelect(item)}
          style={[styles.card, selected ? styles.selectedItem : {}]}>
          <Text style={selected ? styles.selectedItem : {}}>
            {getCategoryItemLabel(item)}
          </Text>
        </TouchableOpacity>
      );
    },
    [handleSelect, selectedItem, getCategoryItemLabel],
  );

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
        categoryItems={categoryItems}
        renderItem={renderItem}
        searchText={searchText}
      />
    </View>
  );
};

export default FormCodeSingle;
