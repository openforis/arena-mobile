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
  const {handleCreate, handleClose} = useNodeFormActions({nodeDef});

  const applicable = useSelector(state =>
    formSelectors.isNodeDefApplicable(state, nodeDef?.uuid),
  );

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
    [handleSelect, getCategoryItemLabel],
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
        nodes={nodes}
      />
    </View>
  );
};

export default FormCodeMultiple;
