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

const Item = ({
  item,
  selected,
  handleSelect,
  getCategoryItemLabel,
  getCategoryItemDescription,
}) => {
  const handleSelectItem = useCallback(
    e => {
      e.stopPropagation();
      handleSelect(item)(e);
    },
    [handleSelect, item],
  );

  const label = useMemo(
    () => getCategoryItemLabel(item),
    [item, getCategoryItemLabel],
  );

  const description = useMemo(
    () => getCategoryItemDescription(item),
    [item, getCategoryItemDescription],
  );

  const iconName = useMemo(
    () => (selected ? 'radiobox-marked' : 'radiobox-blank'),
    [selected],
  );

  return (
    <ListItem
      handlePress={handleSelectItem}
      label={label}
      description={description}
      selected={selected}
      icon={iconName}
    />
  );
};
const FormCodeSingle = ({nodeDef, node}) => {
  const {
    categoryItems,
    categoryItemsByUuid,
    getCategoryItemLabel,
    getCategoryItemDescription,
  } = useCode({
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
    () => categoryItemsByUuid[node?.value?.itemUuid],
    [categoryItemsByUuid, node],
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

  const renderItem = useCallback(
    ({item}) => {
      const _item = categoryItemsByUuid[item];
      const selected = selectedItem?.uuid === _item?.uuid;

      return (
        <Item
          item={_item}
          selected={selected}
          getCategoryItemLabel={getCategoryItemLabel}
          getCategoryItemDescription={getCategoryItemDescription}
          handleSelect={handleSelect}
        />
      );
    },
    [
      handleSelect,
      categoryItemsByUuid,
      selectedItem,
      getCategoryItemLabel,
      getCategoryItemDescription,
    ],
  );

  return (
    <View style={styles.container}>
      <Header
        searching={searching}
        handleStartToSearch={handleStartToSearch}
        selectedItem={selectedItem}
        _labelExtractor={getCategoryItemLabel}
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
