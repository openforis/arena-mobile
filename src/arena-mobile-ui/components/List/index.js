import React from 'react';
import {View, FlatList} from 'react-native';

import styles from './styles';

const List = ({data, ListEmptyComponent, keyExtractor, renderItem}) => {
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
