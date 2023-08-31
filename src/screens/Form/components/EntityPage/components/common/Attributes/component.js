import React from 'react';
import {View} from 'react-native';

import useThemedStyles from 'arena-mobile-ui/hooks/useThemedStyles';

import {useAttributesUuids} from './hooks';
import ListForm from './ListForm';
import SingleNode from './SingleNode';
import _styles from './styles';

const singleNodeView = false;

const AttributesContainer = () => {
  const styles = useThemedStyles(_styles);
  const nodeDefChildrenUuids = useAttributesUuids();

  return (
    <View style={styles.container}>
      {singleNodeView ? (
        <SingleNode nodeDefChildrenUuids={nodeDefChildrenUuids} />
      ) : (
        <ListForm nodeDefChildrenUuids={nodeDefChildrenUuids} />
      )}
    </View>
  );
};
export default AttributesContainer;
