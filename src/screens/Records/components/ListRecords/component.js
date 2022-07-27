import React, {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import ActualItem from 'arena-mobile-ui/components/ActualItem';
import CreatedAndModified from 'arena-mobile-ui/components/CreatedAndModified';
import List from 'arena-mobile-ui/components/List';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';
import formSelectors from 'state/form/selectors';
import recordsSelectors from 'state/records/selectors';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const ListEmptyComponent = () => <View />;

const RecordCard = ({record, isSelected, onSelect}) => {
  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);
  const currentRecordUuid = useSelector(formSelectors.getRecordUuid);
  const recordKey = useSelector(state =>
    recordsSelectors.gerRecordKey(state, record.uuid),
  );

  const {t} = useTranslation();

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.container, isSelected ? styles.selected : {}]}>
      <View style={[styles.payload]}>
        <Text style={[baseStyles.textStyle.bold]}>{recordKey}</Text>
        <CreatedAndModified
          dateCreated={record?.dateCreated}
          dateModified={record?.dateModified}
        />
      </View>
      {currentRecordUuid === record.uuid && (
        <ActualItem label={t('Records:actual_record')} />
      )}
    </TouchableCard>
  );
};
const ListRecords = ({selectedRecord, setSelectedRecord}) => {
  const keyExtractor = useCallback(item => `${item.uuid}`, []);

  const renderItem = useCallback(
    ({item}) => (
      <RecordCard
        isSelected={selectedRecord?.uuid === item?.uuid}
        record={item}
        onSelect={setSelectedRecord}
      />
    ),
    [selectedRecord, setSelectedRecord],
  );

  const records = useSelector(surveySelectors.getRecords);

  return (
    <List
      data={records}
      ListEmptyComponent={ListEmptyComponent}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
    />
  );
};

export default ListRecords;
