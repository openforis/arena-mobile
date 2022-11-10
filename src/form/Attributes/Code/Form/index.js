import React, {useState, useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import Input from 'arena-mobile-ui/components/Input';
import List from 'arena-mobile-ui/components/List';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import BaseForm from 'form/Attributes/common/Base/Form';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {useCode} from '../Preview/hooks';

import styles from './styles';

const ChevronDown = <Icon name="chevron-down" />;

const getTextForSearch = item => {
  const labels = Object.entries(item?.props?.labels || {}).map(
    ([_, label]) => label,
  );
  return [item?.props?.code]
    .concat(labels)
    .join('.')
    .toLowerCase()
    .normalize('NFD');
};

const FormCodeSingle = ({nodeDef, node}) => {
  const {t} = useTranslation();

  const {categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
    node,
  });
  const categoryItemsWithIndexToSearch = useMemo(() => {
    return categoryItems.map(item =>
      Object.assign({}, item, {textForSearch: getTextForSearch(item)}),
    );
  }, [categoryItems]);
  const {handleUpdate, handleCreate} = useNodeFormActions({nodeDef});

  const selectedItem = useMemo(
    () => categoryItems.find(item => item.uuid === node?.value?.itemUuid),
    [categoryItems, node],
  );

  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const categoryItemsFiltered = useMemo(() => {
    if (searchText) {
      const searchTextNormalized = searchText.toLowerCase().normalize('NFD');
      return categoryItemsWithIndexToSearch.filter(categoryItem =>
        categoryItem?.textForSearch.includes(searchTextNormalized),
      );
    }
    return categoryItemsWithIndexToSearch;
  }, [categoryItemsWithIndexToSearch, searchText]);

  const handleSelect = useCallback(
    categoryItem => e => {
      e.stopPropagation();
      handleSelect(categoryItem);
      setSearchText(false);
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
      const selected = selectedItem.uuid === item.uuid;
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
    [handleSelect, selectedItem],
  );
  const keyExtractor = useCallback(item => item.uuid, []);
  const handleStartToSearch = useMemo(() => setSearching(true), []);
  const handleStopToSearch = useMemo(() => setSearching(false), []);
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
        <View style={styles.selectBarContainer}>
          <View style={styles.selectContainer}>
            <Input
              onChangeText={setSearchText}
              defaultValue={String('')}
              autoFocus={true}
              horizontal={true}
              stacked={false}
              customStyle={styles.searchBox}
              hasTitle={false}
              onBlur={handleStopToSearch}
              returnKeyType="done"
            />
          </View>
          <TouchableIcon
            iconName={'close'}
            onPress={handleStopToSearch}
            customStyle={styles.close}
          />
        </View>
      )}

      <List
        data={categoryItemsFiltered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
      />
    </View>
  );
};

const CodeForm = ({nodeDef}) => {
  const node = useSelector(formSelectors.getNode);

  return (
    <BaseForm nodeDef={nodeDef} hasSubmitButton={false}>
      <FormCodeSingle nodeDef={nodeDef} node={node} />
    </BaseForm>
  );
};

export default CodeForm;
