import moment from 'moment-timezone';
import React, {useCallback} from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import List from 'arena-mobile-ui/components/List';
import TouchableCard from 'arena-mobile-ui/components/TouchableCard';
import baseStyles from 'arena-mobile-ui/styles';
import recordsSelectors from 'state/records/selectors';
import {selectors as surveySelectors} from 'state/survey';

import styles from './styles';

const ListEmptyComponent = () => <View />;

const RecordCard = ({record, isSelected, onSelect}) => {
  const handlePress = useCallback(() => {
    onSelect?.(record);
  }, [record, onSelect]);

  const recordKey = useSelector(state =>
    recordsSelectors.gerRecordKey(state, record.uuid),
  );

  return (
    <TouchableCard
      onPress={handlePress}
      customStyles={[styles.cardContainer, isSelected ? styles.selected : {}]}>
      <View>
        <Text style={[baseStyles.textStyle.bold]}>{recordKey}</Text>
        <Text style={[baseStyles.textStyle.secondaryText]}>
          {moment(record.dateCreated).fromNow()} -{' '}
          {moment(record.dateModified).fromNow()}
        </Text>
      </View>
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
