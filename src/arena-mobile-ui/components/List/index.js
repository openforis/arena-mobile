import React from 'react';
import {View, FlatList} from 'react-native';

import styles from './styles';

const Footer = () => {
  return <View style={styles.block} />;
};
const ItemSeparatorComponent = () => {
  return <></>;
};
const CellRendererComponent = ({children}) => {
  return <>{children}</>;
};

const List = ({
  data,
  ListEmptyComponent,
  keyExtractor,
  renderItem,
  stickyHeaderIndices,
  extraData,
  onRefresh,
  refreshing,
}) => {
  return (
    <View style={styles.container}>
      <FlatList
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        data={data}
        renderItem={renderItem}
        ListEmptyComponent={ListEmptyComponent}
        keyExtractor={keyExtractor}
        ListFooterComponent={Footer}
        keyboardDismissMode="none"
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps={'handled'}
        stickyHeaderIndices={stickyHeaderIndices}
        ItemSeparatorComponent={ItemSeparatorComponent}
        extraData={extraData}
        maxToRenderPerBatch={4}
        CellRendererComponent={CellRendererComponent}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
};

List.defaultProps = {
  ListEmptyComponent: () => null,
  stickyHeaderIndices: [],

  extraData: null,
  onRefresh: () => {},
  refreshing: false,
};

export default List;
