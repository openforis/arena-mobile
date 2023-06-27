import React, {useCallback} from 'react';
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

const FormCodeMultiple = ({nodeDef}) => {
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
          handleDelete({node, label, requestConfirm: false});
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
      const action = selected
        ? _handleDelete({node: selectedNode, label})
        : handleSelect(item);

      return (
        <ListItem
          label={label}
          handlePress={action}
          selected={selected}
          icon={selected ? 'checkbox-marked' : 'checkbox-blank-outline'}
        />
      );
    },
    [handleSelect, getCategoryItemLabel, nodes, _handleDelete],
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
      />
    </View>
  );
};

export default FormCodeMultiple;
