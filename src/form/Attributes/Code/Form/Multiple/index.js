import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import List from 'form/Attributes/common/SearchableForm/List';
import Header from 'form/Attributes/common/SearchableForm/List/Header';
import ListItem from 'form/Attributes/common/SearchableForm/List/Item';
import {Objects} from 'infra/objectUtils';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {useCode} from '../../Preview/hooks';
import {useSearch} from '../common/hooks/useSearch';

import styles from './styles';

const Item = ({
  item,
  selectedNode,
  selected,
  handleSelect,
  getCategoryItemLabel,
  handleDelete,
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

  const action = useCallback(
    e =>
      selected
        ? handleDelete({node: selectedNode, label})()
        : handleSelectItem(e),
    [selected, handleDelete, selectedNode, label, handleSelectItem],
  );

  const iconName = useMemo(
    () => (selected ? 'checkbox-marked' : 'checkbox-blank-outline'),
    [selected],
  );

  return (
    <ListItem
      handlePress={action}
      label={label}
      selected={selected}
      icon={iconName}
    />
  );
};

const FormCodeMultiple = ({nodeDef}) => {
  const {nodes, categoryItems, categoryItemsByUuid, getCategoryItemLabel} =
    useCode({
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
          handleDelete({node, label, requestConfirm: false});
        }
      },
    [handleDelete, applicable],
  );

  const renderItem = useCallback(
    ({item}) => {
      const _item = categoryItemsByUuid[item];
      const selectedNode = nodes.find(
        node => node?.value?.itemUuid === _item.uuid,
      );
      const selected = !Objects.isEmpty(selectedNode);

      return (
        <Item
          item={_item}
          selectedNode={selectedNode}
          selected={selected}
          getCategoryItemLabel={getCategoryItemLabel}
          handleSelect={handleSelect}
          handleDelete={_handleDelete}
        />
      );
    },
    [
      handleSelect,
      categoryItemsByUuid,
      getCategoryItemLabel,
      nodes,
      _handleDelete,
    ],
  );

  return (
    <View style={styles.container}>
      <Header
        searching={searching}
        handleStartToSearch={handleStartToSearch}
        selectedItem={null}
        _labelStractor={null}
        applicable={applicable}
        handleStopToSearch={handleStopToSearch}
        setSearchText={setSearchText}
      />

      <List
        categoryItems={categoryItems}
        renderItem={renderItem}
        searchText={searchText}
        nodes={nodes}
      />
    </View>
  );
};

export default FormCodeMultiple;
