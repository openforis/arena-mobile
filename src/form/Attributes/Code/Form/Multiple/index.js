import React, {useState, useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSelector} from 'react-redux';

import Button from 'arena-mobile-ui/components/Button';
import Icon from 'arena-mobile-ui/components/Icon';
import Input from 'arena-mobile-ui/components/Input';
import List from 'arena-mobile-ui/components/List';
import {TouchableIcon} from 'arena-mobile-ui/components/TouchableIcons';
import useNodeFormActions from 'state/form/hooks/useNodeFormActions';
import formSelectors from 'state/form/selectors';

import {useCode} from '../../Preview/hooks';

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

const FormCodeMultiple = ({nodeDef}) => {
  const {t} = useTranslation();

  const {nodes, categoryItems, getCategoryItemLabel} = useCode({
    nodeDef,
  });

  const categoryItemsWithIndexToSearch = useMemo(() => {
    return categoryItems.map(item =>
      Object.assign({}, item, {textForSearch: getTextForSearch(item)}),
    );
  }, [categoryItems]);

  const {handleCreate, handleClose} = useNodeFormActions({nodeDef});

  const [searching, setSearching] = useState(false);
  const [searchText, setSearchText] = useState('');
  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

  const categoryItemsFiltered = useMemo(() => {
    if (searchText) {
      const searchTextNormalized = searchText.toLowerCase().normalize('NFD');
      return categoryItemsWithIndexToSearch.filter(
        categoryItem =>
          categoryItem?.textForSearch.includes(searchTextNormalized) &&
          !nodes.some(node => node?.value?.itemUuid === categoryItem.uuid),
      );
    }
    return categoryItemsWithIndexToSearch.filter(
      categoryItem =>
        !nodes.some(node => node?.value?.itemUuid === categoryItem.uuid),
    );
  }, [categoryItemsWithIndexToSearch, searchText, nodes]);

  const handleSelect = useCallback(
    categoryItem => e => {
      e.stopPropagation();
      if (categoryItem) {
        let newValue = {itemUuid: categoryItem.uuid};
        handleCreate({value: newValue, callback: handleClose});
      }
    },
    [handleCreate, handleClose],
  );

  const renderItem = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity onPress={handleSelect(item)} style={styles.card}>
          <Text>{getCategoryItemLabel(item)}</Text>
        </TouchableOpacity>
      );
    },
    [handleSelect],
  );

  const keyExtractor = useCallback(item => item.uuid, []);
  const handleStartToSearch = useCallback(() => setSearching(true), []);
  const handleStopToSearch = useCallback(() => setSearching(false), []);
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

export default FormCodeMultiple;
