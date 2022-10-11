import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import List from 'arena-mobile-ui/components/List';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';
import formSelectors from 'state/form/selectors';
import {useRecordsUuids, useRecordByUuid} from 'state/records/hooks';

import styles from './styles';

const ListEmptyComponent = () => <View />;

const RecordCard = ({recordUuid, isSelected, onSelect}) => {
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);
  const record = useRecordByUuid(recordUuid);
  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const {t} = useTranslation();

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View style={[styles.payload]}>
        <Text style={[baseStyles.textStyle.bold]}>
          {record.recordKey || '-'}
        </Text>
        <CreatedAndModified
          dateCreated={record?.dateCreated}
          dateModified={record?.dateModified}
        />
      </View>
      {currentRecordUuid === recordUuid && (
        <CurrentItemLabel label={t('Records:current_record')} />
      )}
    </TouchableCard>
  );
};

const ListRecords = ({selectedRecordUuid, setSelectedRecord}) => {
  const keyExtractor = useCallback(item => item, []);

  const renderItem = useCallback(
    ({item}) => (
      <RecordCard
        isSelected={selectedRecordUuid === item}
        recordUuid={item}
        onSelect={setSelectedRecord}
      />
    ),
    [selectedRecordUuid, setSelectedRecord],
  );

  const recordUuids = useRecordsUuids();

  return (
    <List
      data={recordUuids}
      ListEmptyComponent={ListEmptyComponent}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

export default ListRecords;
