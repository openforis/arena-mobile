import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import CurrentItemLabel from 'arena-mobile-ui/components/CurrentItemLabel';
import List from 'arena-mobile-ui/components/List';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import TextBase from 'arena-mobile-ui/components/Texts/TextBase';

import formSelectors from 'state/form/selectors';
import {useRecordsUuidsSorted, useRecordsSummary} from 'state/records/hooks';

import styles from './styles';

const ListEmptyComponent = () => <View />;

const RecordCard = ({record, recordUuid, isSelected, onSelect}) => {
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);

  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const {t} = useTranslation();

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View style={[styles.payload]}>
        <TextBase type="bold">{record.recordKey || '-'}</TextBase>
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

  const recordsSummary = useRecordsSummary();
  const recordUuids = useRecordsUuidsSorted(recordsSummary);

  const renderItem = useCallback(
    ({item: recordUuid}) => (
      <RecordCard
        isSelected={selectedRecordUuid === recordUuid}
        recordUuid={recordUuid}
        onSelect={setSelectedRecord}
        record={recordsSummary?.[recordUuid] || {}}
      />
    ),
    [recordsSummary, selectedRecordUuid, setSelectedRecord],
  );

  if (recordUuids.length <= 0) {
    return <></>;
  }

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
