import {Objects} from '@openforis/arena-core';
import React, {useCallback} from 'react';
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

const FormCodeMultiple = ({nodeDef}) => {
  const {t} = useTranslation();

  const {nodes, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  const {
    searchText,
    searching,
    setSearchText,
    handleStartToSearch,
    handleStopToSearch,
  } = useSearch(false);
  const {handleCreate, handleDelete} = useNodeFormActions({
    nodeDef,
  });

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const handleSelect = useCallback(
    categoryItem => e => {
      e.stopPropagation();
      if (categoryItem) {
        let newValue = {itemUuid: categoryItem.uuid};
        handleCreate({value: newValue});
      }
    },
    [handleCreate],
  );

  const _handleDelete = useCallback(
    ({node, label}) =>
      () => {
        if (applicable) {
          handleDelete({node, label});
        }
      },
    [handleDelete, applicable],
  );

  const renderItem = useCallback(
    ({item}) => {
      const selectedNode = nodes.find(
        node => node?.value?.itemUuid === item.uuid,
      );
      const selected = !Objects.isEmpty(selectedNode);
      const label = getCategoryItemLabel(item);

      return (
        <TouchableOpacity
          onPress={
            selected
              ? _handleDelete({node: selectedNode, label})
              : handleSelect(item)
          }
          style={[styles.card, selected ? styles.selectedItem : {}]}>
          <Text style={selected ? styles.selectedItem : {}}>{label}</Text>
        </TouchableOpacity>
      );
    },
    [handleSelect, getCategoryItemLabel, nodes, _handleDelete],
  );

  return (
    <View style={styles.container}>
      {!searching ? (
        <Button
          onPress={handleStartToSearch}
          type="secondary"
          iconPosition="right"
          label={t('Form:select_empty')}
          icon={ChevronDown}
          customContainerStyle={styles.select}
          customTextStyle={styles.text}
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

export default FormCodeMultiple;
