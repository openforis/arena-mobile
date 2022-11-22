import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import List from 'form/Attributes/common/SearchableForm/List';
import Header from 'form/Attributes/common/SearchableForm/List/Header';
import ListItem from 'form/Attributes/common/SearchableForm/List/Item';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {useCode} from '../../Preview/hooks';
import {useSearch} from '../common/hooks/useSearch';

import styles from './styles';

const FormCodeSingle = ({nodeDef, node}) => {
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
        <ListItem
          handlePress={handleSelect(item)}
          label={getCategoryItemLabel(item)}
          selected={selected}
        />
      );
    },
    [handleSelect, selectedItem, getCategoryItemLabel],
  );

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
      />

      <List
        categoryItems={categoryItems}
        renderItem={renderItem}
        searchText={searchText}
      />
    </View>
  );
};

export default FormCodeSingle;
