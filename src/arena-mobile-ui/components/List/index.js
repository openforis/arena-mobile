import React from 'react';
import {View, FlatList} from 'react-native';

import styles from './styles';

const Footer = () => {
  return <View style={[styles.block]} />;
};

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
        ListFooterComponent={Footer}
        keyboardDismissMode="none"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps={'handled'}
      />
    </View>
  );
};

export default List;
