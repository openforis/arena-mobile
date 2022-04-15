import React, {useCallback} from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';

import List from 'arena-mobile-ui/components/List';
import {selectors as surveySelectors} from 'state/survey';

const ListEmptyComponent = () => <View />;
const ListRecords = ({selectedRecord, setSelectedRecord}) => {
  const keyExtractor = useCallback(item => `${item.uuid}`, []);

  const renderItem = useCallback(
    ({item}) => (
      <View>
        <Text>{JSON.stringify(item, null, 2)}</Text>
      </View>
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
