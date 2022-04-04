import React, {useCallback} from 'react';
import {View, FlatList} from 'react-native';

import SurveyCard from '../SurveyCard';

import styles from './styles';

const List = ({
  data,
  ListEmptyComponent,
  selectedSurvey,
  setSelectedSurvey,
}) => {
  const keyExtractor = useCallback(item => `${item.info.id}`, []);

  const renderItem = useCallback(
    ({item}) => (
      <SurveyCard
        survey={item}
        onSelect={setSelectedSurvey}
        isSelected={selectedSurvey?.info?.uuid === item?.info?.uuid}
      />
    ),
    [selectedSurvey, setSelectedSurvey],
  );

  return (
    <View style={[styles.container]}>
      <FlatList
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        keyExtractor={keyExtractor}
        ListFooterComponent={<View style={[styles.block]} />}
      />
    </View>
  );
};
export default List;
