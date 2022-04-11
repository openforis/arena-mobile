import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';

import List from 'arena-mobile-ui/components/List';
import {selectors as recordsSelectors} from 'state/records';

const ListEmptyComponent = () => <View />;
const ListRecords = ({selectedRecord, setSelectedRecord}) => {
  const keyExtractor = useCallback(item => `${item.info.id}`, []);

  const renderItem = useCallback(
    ({item}) => <View />,
    [selectedRecord, setSelectedRecord],
  );

  const records = useSelector(recordsSelectors.getRecordsInSurvey);

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
